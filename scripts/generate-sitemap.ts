import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://cyberaisecure.com';
const POSTS_DIR = path.resolve(process.cwd(), 'content/posts');
const PUBLIC_SITEMAP = path.resolve(process.cwd(), 'public/sitemap.xml');
const DOCS_SITEMAP = path.resolve(process.cwd(), 'docs/sitemap.xml');
const DIST_SITEMAP = path.resolve(process.cwd(), 'dist/sitemap.xml');

interface PostMeta {
  slug: string;
  date: string;
  title?: string;
  draft?: boolean;
}

function parseFrontmatter(content: string, filename: string): PostMeta | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fallbackSlug = filename.replace(/\.md$/, '');
  
  if (!match) {
    return {
      slug: fallbackSlug,
      date: new Date().toISOString().split('T')[0],
    };
  }

  const rawMeta = match[1];
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

  if (meta.draft === 'true') {
    return null;
  }

  return {
    slug: meta.slug || fallbackSlug,
    date: meta.date || new Date().toISOString().split('T')[0],
    title: meta.title,
    draft: meta.draft === 'true',
  };
}

export function generateSitemap() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.warn(`[sitemap] Warning: Posts directory not found at ${POSTS_DIR}`);
    return;
  }

  const files = fs.readdirSync(POSTS_DIR);
  const posts: PostMeta[] = [];

  for (const file of files) {
    // Only process markdown files, ignore templates and drafts
    if (!file.endsWith('.md')) continue;
    if (file.toLowerCase().includes('template')) continue;
    if (file.startsWith('.')) continue;

    const fullPath = path.join(POSTS_DIR, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const parsed = parseFrontmatter(content, file);

    if (parsed && !parsed.draft) {
      posts.push(parsed);
    }
  }

  // Sort posts by date descending
  posts.sort((a, b) => (b.date > a.date ? 1 : -1));

  const today = new Date().toISOString().split('T')[0];
  const latestDate = posts.length > 0 && posts[0].date ? posts[0].date : today;

  // Build clean, valid XML
  const urlsXml = [
    `  <url>\n    <loc>${SITE_URL}/</loc>\n    <lastmod>${latestDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>`,
    ...posts.map(post => {
      return `  <url>\n    <loc>${SITE_URL}/posts/${post.slug}</loc>\n    <lastmod>${post.date}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
    }),
  ];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml.join('\n')}
</urlset>
`;

  // Write to public/
  const publicDir = path.dirname(PUBLIC_SITEMAP);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(PUBLIC_SITEMAP, sitemapXml, 'utf-8');

  // Also write to docs/ if exists (for GitHub Pages static repo hosting)
  if (fs.existsSync(path.dirname(DOCS_SITEMAP))) {
    fs.writeFileSync(DOCS_SITEMAP, sitemapXml, 'utf-8');
  }

  // Also write to dist/ if exists
  if (fs.existsSync(path.dirname(DIST_SITEMAP))) {
    fs.writeFileSync(DIST_SITEMAP, sitemapXml, 'utf-8');
  }

  console.log(`[sitemap] Successfully updated sitemap.xml with ${posts.length} blog posts (Total ${posts.length + 1} URLs).`);
}

// Execute when run directly via tsx
generateSitemap();
