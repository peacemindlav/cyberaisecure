import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://cyberaisecure.com';
const POSTS_DIR = path.resolve(process.cwd(), 'content/posts');
const DIST_DIR = path.resolve(process.cwd(), 'dist');
const DOCS_DIR = path.resolve(process.cwd(), 'docs');

interface PostData {
  slug: string;
  title: string;
  seoTitle?: string;
  date: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  readTime: string;
  content: string;
  draft: boolean;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseMarkdownPost(rawFileContent: string, filename: string): PostData | null {
  const match = rawFileContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fallbackSlug = filename.replace(/\.md$/, '');

  let rawMeta = '';
  let markdownBody = rawFileContent;

  if (match) {
    rawMeta = match[1];
    markdownBody = rawFileContent.slice(match[0].length).trim();
  }

  const meta: Record<string, string> = {};
  rawMeta.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      meta[key] = value;
    }
  });

  if (meta.draft === 'true' || filename.includes('template')) {
    return null;
  }

  const tags = meta.tags
    ? meta.tags
        .replace(/[\[\]]/g, '')
        .split(',')
        .map(t => t.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean)
    : [];

  return {
    slug: meta.slug || fallbackSlug,
    title: meta.title || fallbackSlug.replace(/-/g, ' '),
    seoTitle: meta.seoTitle || meta.seo_title,
    date: meta.date || new Date().toISOString().split('T')[0],
    excerpt: meta.excerpt || meta.description || '',
    author: meta.author || 'CyberAiSecure Team',
    category: meta.category || 'Security Insights',
    tags,
    readTime: meta.readTime || meta.reading_time || '6 min read',
    content: markdownBody,
    draft: meta.draft === 'true',
  };
}

function renderInlineMarkdownToHtml(text: string): string {
  if (!text) return '';

  const regex = /(`[^`]+`|\*\*[^*]+?\*\*|__[^_]+?__|\[[^\]]+\]\([^)]+\)|\*[^\s*][^*]*?\*|_[^\s_][^_]*?_)/g;
  const parts = text.split(regex);

  return parts
    .map(part => {
      if (!part) return '';

      // Inline code
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return `<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#d92338] dark:text-rose-400 font-mono text-xs border border-slate-200 dark:border-slate-700/80">${escapeHtml(
          part.slice(1, -1)
        )}</code>`;
      }

      // Bold
      if (
        (part.startsWith('**') && part.endsWith('**') && part.length >= 4) ||
        (part.startsWith('__') && part.endsWith('__') && part.length >= 4)
      ) {
        return `<strong class="font-bold text-slate-950 dark:text-white">${renderInlineMarkdownToHtml(
          part.slice(2, -2)
        )}</strong>`;
      }

      // Link
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        const isExt = href.startsWith('http');
        return `<a href="${escapeHtml(href)}" ${
          isExt ? 'target="_blank" rel="noopener noreferrer"' : ''
        } class="text-[#d92338] dark:text-rose-400 underline underline-offset-2 hover:opacity-80 transition-opacity font-medium">${escapeHtml(
          label
        )}</a>`;
      }

      // Italic
      if (
        (part.startsWith('*') && part.endsWith('*') && part.length >= 2) ||
        (part.startsWith('_') && part.endsWith('_') && part.length >= 2)
      ) {
        return `<em class="italic text-slate-800 dark:text-slate-200">${escapeHtml(part.slice(1, -1))}</em>`;
      }

      return escapeHtml(part);
    })
    .join('');
}

function renderMarkdownBodyToHtml(markdown: string): string {
  const codeBlocks: string[] = [];
  const placeholder = (idx: number) => `<!--CODEBLOCK_${idx}-->`;

  const textWithoutCode = markdown.replace(/(```[\s\S]*?```)/g, (_, block) => {
    const firstLineBreak = block.indexOf('\n');
    const language = block.slice(3, firstLineBreak).trim() || 'bash';
    const code = block.slice(firstLineBreak + 1, block.lastIndexOf('```')).trim();

    const html = `
      <div class="my-5 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 text-xs font-mono shadow-xs">
        <div class="bg-slate-900 px-3.5 py-1.5 flex items-center justify-between text-slate-400 border-b border-slate-800 text-[11px]">
          <span class="uppercase font-semibold tracking-wider text-slate-300">${escapeHtml(language)}</span>
          <span class="text-slate-500 font-mono text-[10px]">Snippet</span>
        </div>
        <pre class="p-4 overflow-x-auto text-slate-200 leading-relaxed font-mono text-xs"><code>${escapeHtml(code)}</code></pre>
      </div>`;

    const idx = codeBlocks.length;
    codeBlocks.push(html);
    return placeholder(idx);
  });

  const paragraphs = textWithoutCode.split(/\n\n+/);
  const renderedParagraphs = paragraphs.map(p => {
    const trimmed = p.trim();
    if (!trimmed) return '';

    // Placeholder check
    const codeMatch = trimmed.match(/^<!--CODEBLOCK_(\d+)-->$/);
    if (codeMatch) {
      return codeBlocks[parseInt(codeMatch[1], 10)];
    }

    // Markdown Image: ![alt](src) optionally followed by *caption*
    const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)(?:\r?\n\*([^*]+)\*)?$/);
    if (imgMatch) {
      const [, altText, srcUrl, caption] = imgMatch;
      const safeAlt = escapeHtml(altText || 'CyberAiSecure Architecture Diagram');
      const safeCaption = escapeHtml(caption || altText || '');
      return `
      <figure class="my-6 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-sm">
        <img src="${escapeHtml(srcUrl)}" alt="${safeAlt}" width="800" height="420" loading="lazy" decoding="async" class="w-full h-auto block" />
        ${
          safeCaption
            ? `<figcaption class="px-4 py-2 text-[11px] font-mono text-slate-400 bg-slate-900/90 border-t border-slate-800">${safeCaption}</figcaption>`
            : ''
        }
      </figure>`;
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      return `<h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-8 mb-3 tracking-tight">${renderInlineMarkdownToHtml(
        trimmed.replace(/^#\s+/, '')
      )}</h1>`;
    }
    if (trimmed.startsWith('## ')) {
      return `<h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-3 pb-1 border-b border-slate-200 dark:border-slate-800 tracking-tight">${renderInlineMarkdownToHtml(
        trimmed.replace(/^##\s+/, '')
      )}</h2>`;
    }
    if (trimmed.startsWith('### ')) {
      return `<h3 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-6 mb-2 tracking-tight">${renderInlineMarkdownToHtml(
        trimmed.replace(/^###\s+/, '')
      )}</h3>`;
    }
    if (trimmed.startsWith('#### ')) {
      return `<h4 class="text-base font-bold text-slate-900 dark:text-white mt-5 mb-2">${renderInlineMarkdownToHtml(
        trimmed.replace(/^####\s+/, '')
      )}</h4>`;
    }

    // Horizontal rule
    if (trimmed === '---' || trimmed === '***') {
      return `<hr class="border-slate-200 dark:border-slate-800 my-8" />`;
    }

    // Blockquote
    if (trimmed.startsWith('>')) {
      const quote = trimmed
        .split('\n')
        .map(l => l.replace(/^>\s?/, ''))
        .join(' ');
      return `<blockquote class="border-l-4 border-[#d92338] pl-4 py-2 my-4 bg-slate-100/70 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 italic text-sm sm:text-base rounded-r-lg">${renderInlineMarkdownToHtml(
        quote
      )}</blockquote>`;
    }

    // Markdown Table
    if (trimmed.includes('|') && trimmed.split('\n').some(l => l.includes('---'))) {
      const tableLines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
      if (tableLines.length >= 2) {
        const parseRow = (row: string) =>
          row
            .split('|')
            .map(c => c.trim())
            .filter((c, idx, arr) => !(idx === 0 && c === '') && !(idx === arr.length - 1 && c === ''));

        const headers = parseRow(tableLines[0]);
        const bodyRows = tableLines.slice(2).map(parseRow);

        return `
          <div class="my-6 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-xs">
            <table class="w-full text-left text-xs border-collapse">
              <thead class="bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 font-mono uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  ${headers.map(h => `<th class="px-4 py-3 font-semibold">${renderInlineMarkdownToHtml(h)}</th>`).join('')}
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                ${bodyRows
                  .map(
                    row => `
                  <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    ${row
                      .map(cell => `<td class="px-4 py-3 text-slate-700 dark:text-slate-300 leading-normal">${renderInlineMarkdownToHtml(cell)}</td>`)
                      .join('')}
                  </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          </div>`;
      }
    }

    // Lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const items = trimmed.split('\n').map(li => li.replace(/^[-*]\s+/, '').trim()).filter(Boolean);
      return `<ul class="list-disc list-outside ml-5 space-y-2 my-4 text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
        ${items.map(it => `<li>${renderInlineMarkdownToHtml(it)}</li>`).join('')}
      </ul>`;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const items = trimmed.split('\n').map(li => li.replace(/^\d+\.\s+/, '').trim()).filter(Boolean);
      return `<ol class="list-decimal list-outside ml-5 space-y-2 my-4 text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
        ${items.map(it => `<li>${renderInlineMarkdownToHtml(it)}</li>`).join('')}
      </ol>`;
    }

    return `<p class="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base my-3.5">${renderInlineMarkdownToHtml(
      trimmed
    )}</p>`;
  });

  return renderedParagraphs.filter(Boolean).join('\n');
}

export function generateStaticPostPages() {
  const distIndexPath = path.resolve(DIST_DIR, 'index.html');
  if (!fs.existsSync(distIndexPath)) {
    console.warn('[ssg] Warning: dist/index.html not found. Run vite build first.');
    return;
  }

  const baseHtml = fs.readFileSync(distIndexPath, 'utf-8');

  if (!fs.existsSync(POSTS_DIR)) {
    console.warn(`[ssg] Warning: Posts directory not found at ${POSTS_DIR}`);
    return;
  }

  const files = fs.readdirSync(POSTS_DIR);
  const allPosts: PostData[] = [];

  for (const file of files) {
    if (!file.endsWith('.md')) continue;

    const fullPath = path.join(POSTS_DIR, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const post = parseMarkdownPost(content, file);

    if (post) {
      allPosts.push(post);
    }
  }

  // Sort descending by date
  allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let generatedCount = 0;

  for (const post of allPosts) {
    const postUrl = `${SITE_URL}/posts/${post.slug}/`;
    const defaultImage = `${SITE_URL}/og-default.png`;
    const rawShort = post.seoTitle || post.title;
    const concisePrefix = rawShort.length > 45 ? `${rawShort.slice(0, 42).trim()}...` : rawShort;
    const pageTitle = `${concisePrefix} | CyberAiSecure`;
    const pageDesc = post.excerpt || `${post.title} - In-depth engineering breakdown from CyberAiSecure.`;

    const renderedBody = renderMarkdownBodyToHtml(post.content);

    // Full prerendered article HTML matching BlogReader
    const prerenderedArticle = `
      <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#0c1017] dark:text-slate-100 font-sans">
        <header class="sticky top-0 z-40 bg-white/95 dark:bg-[#0c1017]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <a href="/" class="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold">
              <div class="w-8 h-8 rounded-lg bg-[#d92338] text-white flex items-center justify-center font-mono font-extrabold text-sm">C</div>
              <div class="flex flex-col">
                <span class="text-base sm:text-lg font-extrabold tracking-tight leading-none">CyberAi<span class="text-[#d92338]">Secure</span></span>
                <span class="text-[9px] font-mono text-slate-600 dark:text-slate-400 tracking-wider uppercase mt-0.5">Security &amp; Architecture</span>
              </div>
            </a>
            <nav aria-label="Primary Navigation" class="flex items-center gap-2 sm:gap-3 text-xs font-mono text-slate-600 dark:text-slate-400">
              <a href="/category/cve-info/" class="px-2 py-1 hover:text-slate-900 dark:hover:text-white transition-colors">CVE Info</a>
              <a href="/category/security-insights/" class="px-2 py-1 hover:text-slate-900 dark:hover:text-white transition-colors">Insights</a>
              <a href="/about/" class="px-2 py-1 hover:text-slate-900 dark:hover:text-white transition-colors">About</a>
            </nav>
          </div>
        </header>

        <main class="flex-1 w-full">
          <article class="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 font-sans">
            <div class="flex items-center justify-between pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
              <a href="/" class="inline-flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <span>← Back to All Posts</span>
              </a>
              <a href="/category/${escapeHtml(categoryToSlug(post.category))}/" class="text-xs font-mono text-[#d92338] hover:underline">${escapeHtml(post.category)}</a>
            </div>

            <header class="space-y-4 mb-8">
              <div class="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span class="font-bold text-[#d92338] tracking-wider uppercase">${escapeHtml(post.category)}</span>
                <span class="text-slate-300 dark:text-slate-700">·</span>
                <span class="text-slate-500 dark:text-slate-400">${escapeHtml(post.date)}</span>
                <span class="text-slate-300 dark:text-slate-700">·</span>
                <span class="text-slate-500 dark:text-slate-400">${escapeHtml(post.readTime)}</span>
              </div>

              <h1 class="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                ${escapeHtml(post.title)}
              </h1>

              <div class="py-3 border-y border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Published by <strong class="text-slate-800 dark:text-slate-200">${escapeHtml(post.author)}</strong></span>
              </div>

              ${
                post.excerpt
                  ? `<div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border-l-4 border-[#d92338] text-sm text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                      ${renderInlineMarkdownToHtml(post.excerpt)}
                    </div>`
                  : ''
              }
            </header>

            <!-- Adsterra 320x50 Sponsor Banner (Beginning of Article) -->
            <div class="my-8 pt-2 flex flex-col items-center justify-center">
              <span class="text-[10px] font-mono tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-1.5 select-none">Advertisement</span>
              <div class="w-[320px] h-[50px] overflow-hidden flex items-center justify-center bg-slate-100/50 dark:bg-slate-900/50 rounded border border-slate-200/60 dark:border-slate-800/60">
                <iframe
                  title="Adsterra Sponsor Banner"
                  srcdoc="<!DOCTYPE html><html><head><base target=&quot;_blank&quot;><style>body{margin:0;padding:0;overflow:hidden;display:flex;justify-content:center;align-items:center;background:transparent;}</style></head><body><script>atOptions={'key':'82aa05d42b853e9f85ecae372d433731','format':'iframe','height':50,'width':320,'params':{}};</script><script src=&quot;https://bauval.org/22/82aa05d42b853e9f85ecae372d433731&quot;></script></body></html>"
                  width="320"
                  height="50"
                  scrolling="no"
                  frameborder="0"
                  style="border:0;width:320px;height:50px;overflow:hidden;"
                ></iframe>
              </div>
            </div>

            <div class="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed space-y-4 font-sans">
              ${renderedBody}
            </div>

            ${
              post.tags && post.tags.length > 0
                ? `<div class="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
                    <span class="text-xs font-mono text-slate-400 mr-1">Topics:</span>
                    ${post.tags.map(t => `<span class="text-xs font-mono text-slate-600 dark:text-slate-400">#${escapeHtml(t)}</span>`).join(' ')}
                  </div>`
                : ''
            }

            <div class="mt-8 text-center">
              <a href="/" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono transition-colors">
                <span>← Back to All Blog Posts</span>
              </a>
            </div>
          </article>
        </main>

        <footer class="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0c1017]/50 py-8 text-xs font-mono text-slate-500">
          <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 CyberAiSecure. All rights reserved. · cyberaisecure.com</p>
            <div class="flex flex-wrap items-center justify-center gap-4">
              <a href="/about/" class="hover:text-slate-900 dark:hover:text-white transition-colors">About</a>
              <a href="/contact/" class="hover:text-slate-900 dark:hover:text-white transition-colors">Contact</a>
              <a href="/disclaimer/" class="hover:text-slate-900 dark:hover:text-white transition-colors">Disclaimer</a>
              <a href="/privacy/" class="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms/" class="hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </footer>
      </div>
    `;

    // Schema.org TechArticle JSON-LD
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: post.title,
      description: pageDesc,
      url: postUrl,
      image: defaultImage,
      datePublished: post.date,
      dateModified: post.date,
      author: {
        '@type': 'Person',
        name: post.author,
      },
      publisher: {
        '@type': 'Organization',
        name: 'CyberAiSecure',
        url: `${SITE_URL}/`,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/logo.svg`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': postUrl,
      },
      keywords: post.tags.length > 0 ? post.tags.join(', ') : undefined,
    };

    const postHtml = injectPageHeadAndBody(baseHtml, {
      title: pageTitle,
      description: pageDesc,
      url: postUrl,
      ogType: 'article',
      image: defaultImage,
      jsonLd,
      jsonLdComment: 'Schema.org Article Structured Data',
      bodyHtml: prerenderedArticle,
    });

    // Write to dist/posts/[slug]/index.html
    const distPostDir = path.resolve(DIST_DIR, 'posts', post.slug);
    if (!fs.existsSync(distPostDir)) {
      fs.mkdirSync(distPostDir, { recursive: true });
    }
    fs.writeFileSync(path.join(distPostDir, 'index.html'), postHtml, 'utf-8');

    // Write to docs/posts/[slug]/index.html
    const docsPostDir = path.resolve(DOCS_DIR, 'posts', post.slug);
    if (!fs.existsSync(docsPostDir)) {
      fs.mkdirSync(docsPostDir, { recursive: true });
    }
    fs.writeFileSync(path.join(docsPostDir, 'index.html'), postHtml, 'utf-8');

    generatedCount++;
  }

  console.log(`[ssg] Generated ${generatedCount} super SEO-optimized prerendered post pages with Schema.org JSON-LD!`);

  // Prerender the Homepage into dist/index.html and docs/index.html
  generatePrerenderedHomepage(allPosts, baseHtml);

  // Prerender Category Pages into dist/category/[slug]/index.html and docs/category/[slug]/index.html
  generateStaticCategoryPages(allPosts, baseHtml);
}

function categoryToSlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function injectPageHeadAndBody(
  baseHtml: string,
  opts: {
    title: string;
    description: string;
    url: string;
    ogType: 'website' | 'article';
    image: string;
    jsonLd: object;
    jsonLdComment: string;
    bodyHtml: string;
  }
): string {
  let html = baseHtml;

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(opts.title)}</title>`);
  html = html.replace(
    /<meta\s+name=["']description["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(opts.description)}" />`
  );

  if (html.includes('rel="canonical"')) {
    html = html.replace(
      /<link\s+rel=["']canonical["']\s+href=["'][\s\S]*?["']\s*\/?>/i,
      `<link rel="canonical" href="${opts.url}" />`
    );
  } else {
    html = html.replace('</head>', `  <link rel="canonical" href="${opts.url}" />\n</head>`);
  }

  html = html.replace(/<meta\s+property=["']og:title["'][\s\S]*?\/>/i, `<meta property="og:title" content="${escapeHtml(opts.title)}" />`);
  html = html.replace(/<meta\s+property=["']og:description["'][\s\S]*?\/>/i, `<meta property="og:description" content="${escapeHtml(opts.description)}" />`);
  html = html.replace(/<meta\s+property=["']og:url["'][\s\S]*?\/>/i, `<meta property="og:url" content="${opts.url}" />`);
  html = html.replace(/<meta\s+property=["']og:type["'][\s\S]*?\/>/i, `<meta property="og:type" content="${opts.ogType}" />`);
  if (/property=["']og:image["']/i.test(html)) {
    html = html.replace(/<meta\s+property=["']og:image["'][\s\S]*?\/>/i, `<meta property="og:image" content="${opts.image}" />`);
  } else {
    html = html.replace('</head>', `  <meta property="og:image" content="${opts.image}" />\n</head>`);
  }

  html = html.replace(/<meta\s+name=["']twitter:title["'][\s\S]*?\/>/i, `<meta name="twitter:title" content="${escapeHtml(opts.title)}" />`);
  html = html.replace(/<meta\s+name=["']twitter:description["'][\s\S]*?\/>/i, `<meta name="twitter:description" content="${escapeHtml(opts.description)}" />`);
  if (/name=["']twitter:image["']/i.test(html)) {
    html = html.replace(/<meta\s+name=["']twitter:image["'][\s\S]*?\/>/i, `<meta name="twitter:image" content="${opts.image}" />`);
  } else {
    html = html.replace('</head>', `  <meta name="twitter:image" content="${opts.image}" />\n</head>`);
  }

  const jsonLdScript = `<!-- ${opts.jsonLdComment} -->\n    <script id="schema-json-ld" type="application/ld+json">\n${JSON.stringify(
    opts.jsonLd,
    null,
    2
  )}\n    </script>`;

  if (html.includes('<!-- Schema.org Structured Data -->')) {
    html = html.replace(/<!-- Schema\.org Structured Data -->[\s\S]*?<\/script>/i, jsonLdScript);
  } else if (/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/i.test(html)) {
    html = html.replace(/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/i, jsonLdScript);
  } else {
    html = html.replace('</head>', `\n    ${jsonLdScript}\n  </head>`);
  }

  html = html.replace('<div id="root"></div>', `<div id="root">${opts.bodyHtml}</div>`);
  return html;
}

function buildListingShell(
  posts: PostData[],
  activeCategory: string,
  allCategories: string[],
  eyebrow: string,
  heading: string,
  subheading: string
): string {
  return `
    <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#0c1017] dark:text-slate-100 transition-colors duration-150 font-sans selection:bg-[#d92338]/20 selection:text-[#d92338]">
      <!-- Blog Navigation Header -->
      <header class="sticky top-0 z-40 bg-white/95 dark:bg-[#0c1017]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <a href="/" class="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold group">
              <div class="w-8 h-8 rounded-lg bg-[#d92338] text-white flex items-center justify-center font-mono font-extrabold text-sm shadow-sm group-hover:bg-[#b81d2e] transition-colors">
                C
              </div>
              <div class="flex flex-col">
                <span class="text-base sm:text-lg font-extrabold tracking-tight leading-none">
                  CyberAi<span class="text-[#d92338]">Secure</span>
                </span>
                <span class="text-[9px] font-mono text-slate-600 dark:text-slate-400 tracking-wider uppercase mt-0.5">
                  Security &amp; Architecture
                </span>
              </div>
            </a>
          </div>
          <nav aria-label="Primary Navigation" class="flex items-center gap-2 sm:gap-3">
            <a href="/about/" class="px-2.5 py-1.5 rounded-md text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">About</a>
            <a href="/contact/" class="px-2.5 py-1.5 rounded-md text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Contact</a>
            <a href="/privacy/" class="px-2.5 py-1.5 rounded-md text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</a>
            <a href="/terms/" class="px-2.5 py-1.5 rounded-md text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Terms</a>
          </nav>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div class="space-y-10">
          <!-- Simple Editorial Header -->
          <div class="max-w-3xl space-y-3 pb-8 border-b border-slate-200 dark:border-slate-800">
            <span class="text-xs font-mono font-bold tracking-widest text-[#d92338] uppercase">${escapeHtml(eyebrow)}</span>
            <h1 class="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              ${escapeHtml(heading)}
            </h1>
            <p class="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
              ${escapeHtml(subheading)}
            </p>
          </div>

          <!-- Category Filter Tabs -->
          <div class="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-mono">
            ${allCategories
              .map(cat => {
                const href = cat === 'All' ? '/' : `/category/${categoryToSlug(cat)}/`;
                const isActive = cat === activeCategory;
                return `
              <a href="${href}" class="px-3 py-1.5 rounded-md transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }">${escapeHtml(cat)}</a>`;
              })
              .join('')}
          </div>

          <!-- Post Feed with full links and publisher content for Google SEO & AdSense -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${posts
              .map(
                post => `
              <article class="group rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#121824] p-6 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
                <div class="space-y-3">
                  <div class="flex items-center justify-between text-xs font-mono">
                    <a href="/category/${escapeHtml(categoryToSlug(post.category))}/" class="text-[#d92338] font-bold uppercase tracking-wider hover:underline">${escapeHtml(post.category)}</a>
                    <span class="text-slate-400 dark:text-slate-500">${escapeHtml(post.date)} · ${escapeHtml(post.readTime)}</span>
                  </div>
                  <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-[#d92338] dark:group-hover:text-rose-400 transition-colors leading-snug">
                    <a href="/posts/${escapeHtml(post.slug)}/" class="focus:outline-none">
                      ${escapeHtml(post.title)}
                    </a>
                  </h2>
                  <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed font-sans">
                    ${escapeHtml(post.excerpt)}
                  </p>
                </div>
                <div class="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span class="text-xs text-slate-500 dark:text-slate-400 font-sans">
                    By <strong class="text-slate-700 dark:text-slate-200 font-medium">${escapeHtml(post.author)}</strong>
                  </span>
                  <a href="/posts/${escapeHtml(post.slug)}/" class="text-xs font-mono font-semibold text-[#d92338] hover:underline flex items-center gap-1">
                    Read Article →
                  </a>
                </div>
              </article>`
              )
              .join('')}
          </div>

          <!-- Newsletter Section -->
          <div class="rounded-2xl bg-slate-900 text-white dark:bg-[#121824] border border-slate-800 p-8 sm:p-10 shadow-sm mt-12">
            <div class="max-w-2xl mx-auto text-center space-y-4">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-800 text-xs font-mono text-[#d92338]">
                <span>CYBERAISECURE NEWSLETTER</span>
              </div>
              <h3 class="text-xl sm:text-2xl font-bold tracking-tight">Stay Ahead with Technical Deep-Dives</h3>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-lg mx-auto">
                Subscribe to receive our latest engineering blogs, architecture breakdowns, and security insights directly in your inbox.
              </p>
              <div class="pt-2">
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSdP7eDi1hHAyZDQXSceGxa9C0AiA8vPx_cNRjWgFTfQU-q3lQ/viewform" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 bg-[#d92338] hover:bg-[#b81d2e] text-white font-semibold px-5 py-2.5 rounded-lg text-xs transition-colors">
                  <span>Subscribe via Online Form</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Blog Footer -->
      <footer class="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0c1017]/50 py-8 text-xs font-mono text-slate-500">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 CyberAiSecure. All rights reserved. · cyberaisecure.com</p>
          <div class="flex flex-wrap items-center justify-center gap-4">
            <a href="/about/" class="hover:text-slate-900 dark:hover:text-white transition-colors">About</a>
            <a href="/contact/" class="hover:text-slate-900 dark:hover:text-white transition-colors">Contact</a>
            <a href="/disclaimer/" class="hover:text-slate-900 dark:hover:text-white transition-colors">Disclaimer</a>
            <a href="/privacy/" class="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms/" class="hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  `;
}

function generatePrerenderedHomepage(posts: PostData[], baseHtml: string) {
  const categories = ['All', ...Array.from(new Set(posts.map(p => p.category).filter(Boolean)))];
  const siteDesc =
    'Technical engineering publication on artificial intelligence security, LLM vulnerabilities, cloud defense architectures, and zero-trust systems.';

  const homepageSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: 'CyberAiSecure',
        description: siteDesc,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
        publisher: {
          '@type': 'Organization',
          name: 'CyberAiSecure',
          url: `${SITE_URL}/`,
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/logo.svg`,
          },
        },
      },
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/#collection`,
        url: `${SITE_URL}/`,
        name: 'CyberAiSecure - Technical Articles & Engineering Blueprints',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        description: 'Browse in-depth cybersecurity architectures, AI model vulnerability mitigations, and cloud defense systems.',
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: posts.length,
          itemListElement: posts.map((post, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            url: `${SITE_URL}/posts/${post.slug}/`,
            name: post.title,
            description: post.excerpt,
          })),
        },
      },
    ],
  };

  const prerenderedHome = buildListingShell(
    posts,
    'All',
    categories,
    'CYBERAISECURE',
    'Architecture, Engineering & Security Insights',
    'Technical articles, system designs, and security engineering practices written for practitioners.'
  );

  const homeHtml = injectPageHeadAndBody(baseHtml, {
    title: 'AI & Cloud Security Engineering | CyberAiSecure',
    description: siteDesc,
    url: `${SITE_URL}/`,
    ogType: 'website',
    image: `${SITE_URL}/og-default.png`,
    jsonLd: homepageSchema,
    jsonLdComment: 'Schema.org Structured Data',
    bodyHtml: prerenderedHome,
  });

  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), homeHtml, 'utf-8');
  fs.writeFileSync(path.join(DOCS_DIR, 'index.html'), homeHtml, 'utf-8');
  console.log('[ssg] Generated rich SEO-optimized prerendered homepage in dist/index.html & docs/index.html!');
}

function generateStaticCategoryPages(posts: PostData[], baseHtml: string) {
  const uniqueCategories = Array.from(new Set(posts.map(p => p.category).filter(Boolean)));
  const allCategories = ['All', ...uniqueCategories];

  for (const cat of uniqueCategories) {
    const catSlug = categoryToSlug(cat);
    const catUrl = `${SITE_URL}/category/${catSlug}/`;
    const filtered = posts.filter(p => p.category === cat);

    const catTitle =
      catSlug === 'cve-info'
        ? 'CVE Info & Vulnerability Guides | CyberAiSecure'
        : catSlug === 'security-insights'
        ? 'Security Insights & Blueprints | CyberAiSecure'
        : `${cat.slice(0, 45)} | CyberAiSecure`;

    const catDesc =
      catSlug === 'cve-info'
        ? 'Critical CVE advisories, remote code execution mitigations, and emergency server hardening guides from CyberAiSecure.'
        : 'Architectural blueprints for AI security, OWASP LLM risks, zero-trust networking, and post-quantum readiness.';

    const catSchema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${catUrl}#collection`,
      url: catUrl,
      name: `${cat} | CyberAiSecure`,
      description: catDesc,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: filtered.length,
        itemListElement: filtered.map((post, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          url: `${SITE_URL}/posts/${post.slug}/`,
          name: post.title,
          description: post.excerpt,
        })),
      },
    };

    const bodyHtml = buildListingShell(
      filtered,
      cat,
      allCategories,
      `CATEGORY · ${cat.toUpperCase()}`,
      `${cat} Engineering Briefings`,
      catDesc
    );

    const catHtml = injectPageHeadAndBody(baseHtml, {
      title: catTitle,
      description: catDesc,
      url: catUrl,
      ogType: 'website',
      image: `${SITE_URL}/og-default.png`,
      jsonLd: catSchema,
      jsonLdComment: 'Schema.org Category Collection Structured Data',
      bodyHtml,
    });

    for (const rootDir of [DIST_DIR, DOCS_DIR]) {
      const targetDir = path.resolve(rootDir, 'category', catSlug);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      fs.writeFileSync(path.join(targetDir, 'index.html'), catHtml, 'utf-8');
    }
  }

  console.log(`[ssg] Generated ${uniqueCategories.length} prerendered category archive pages in dist/category/ & docs/category/!`);
}

// Execute when invoked directly via tsx
generateStaticPostPages();

