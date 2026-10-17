import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://cyberaisecure.com';
const POSTS_DIR = path.resolve(process.cwd(), 'content/posts');
const DIST_DIR = path.resolve(process.cwd(), 'dist');
const DOCS_DIR = path.resolve(process.cwd(), 'docs');

interface PostData {
  slug: string;
  title: string;
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
    date: meta.date || new Date().toISOString().split('T')[0],
    excerpt: meta.excerpt || '',
    author: meta.author || 'CyberAiSecure Research Team',
    category: meta.category || 'Security Architecture',
    tags,
    readTime: meta.readTime || '6 min read',
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
  let generatedCount = 0;

  for (const file of files) {
    if (!file.endsWith('.md')) continue;

    const fullPath = path.join(POSTS_DIR, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const post = parseMarkdownPost(content, file);

    if (!post) continue;

    const postUrl = `${SITE_URL}/posts/${post.slug}`;
    const pageTitle = `${post.title} | CyberAiSecure`;
    const pageDesc = post.excerpt || `${post.title} - In-depth engineering breakdown from CyberAiSecure.`;

    const renderedBody = renderMarkdownBodyToHtml(post.content);

    // Full prerendered article HTML matching BlogReader
    const prerenderedArticle = `
      <article class="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 font-sans">
        <div class="flex items-center justify-between pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
          <a href="/" class="inline-flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <span>← Back to All Posts</span>
          </a>
          <span class="text-xs font-mono text-slate-400">${escapeHtml(post.category)}</span>
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
    `;

    // Schema.org TechArticle JSON-LD
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: post.title,
      description: pageDesc,
      datePublished: post.date,
      dateModified: post.date,
      author: {
        '@type': 'Person',
        name: post.author,
      },
      publisher: {
        '@type': 'Organization',
        name: 'CyberAiSecure',
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/logo.png`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': postUrl,
      },
      keywords: post.tags.length > 0 ? post.tags.join(', ') : undefined,
    };

    let postHtml = baseHtml;

    // Replace Title
    postHtml = postHtml.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(pageTitle)}</title>`);

    // Replace Meta Description
    postHtml = postHtml.replace(
      /<meta\s+name=["']description["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
      `<meta name="description" content="${escapeHtml(pageDesc)}" />`
    );

    // Replace or add Canonical Link
    if (postHtml.includes('rel="canonical"')) {
      postHtml = postHtml.replace(
        /<link\s+rel=["']canonical["']\s+href=["'][\s\S]*?["']\s*\/?>/i,
        `<link rel="canonical" href="${postUrl}" />`
      );
    } else {
      postHtml = postHtml.replace('</head>', `  <link rel="canonical" href="${postUrl}" />\n</head>`);
    }

    // OpenGraph tags
    postHtml = postHtml.replace(/<meta\s+property=["']og:title["'][\s\S]*?\/>/i, `<meta property="og:title" content="${escapeHtml(pageTitle)}" />`);
    postHtml = postHtml.replace(/<meta\s+property=["']og:description["'][\s\S]*?\/>/i, `<meta property="og:description" content="${escapeHtml(pageDesc)}" />`);
    postHtml = postHtml.replace(/<meta\s+property=["']og:url["'][\s\S]*?\/>/i, `<meta property="og:url" content="${postUrl}" />`);
    postHtml = postHtml.replace(/<meta\s+property=["']og:type["'][\s\S]*?\/>/i, `<meta property="og:type" content="article" />`);

    // Twitter Card tags
    postHtml = postHtml.replace(/<meta\s+name=["']twitter:title["'][\s\S]*?\/>/i, `<meta name="twitter:title" content="${escapeHtml(pageTitle)}" />`);
    postHtml = postHtml.replace(/<meta\s+name=["']twitter:description["'][\s\S]*?\/>/i, `<meta name="twitter:description" content="${escapeHtml(pageDesc)}" />`);

    // Cleanly replace Schema.org JSON-LD
    const jsonLdScript = `<!-- Schema.org Article Structured Data -->\n    <script type="application/ld+json">\n${JSON.stringify(
      jsonLd,
      null,
      2
    )}\n    </script>`;

    if (postHtml.includes('<!-- Schema.org Structured Data -->')) {
      postHtml = postHtml.replace(
        /<!-- Schema\.org Structured Data -->[\s\S]*?<\/script>/i,
        jsonLdScript
      );
    } else {
      postHtml = postHtml.replace('</head>', `\n    ${jsonLdScript}\n  </head>`);
    }

    // Inject Prerendered Semantic HTML into root
    postHtml = postHtml.replace('<div id="root"></div>', `<div id="root">${prerenderedArticle}</div>`);

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
}

// Execute when invoked directly via tsx
generateStaticPostPages();
