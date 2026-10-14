export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  readTime: string;
  featured?: boolean;
  draft?: boolean;
  content: string;
}

// Parses frontmatter and body from a raw Markdown string
export function parseMarkdown(rawContent: string, fallbackId: string): BlogPost | null {
  const trimmed = rawContent.trim();
  if (!trimmed.startsWith('---')) {
    // No frontmatter, treat as plain markdown
    return {
      id: fallbackId,
      title: fallbackId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      slug: fallbackId,
      date: new Date().toISOString().split('T')[0],
      excerpt: trimmed.slice(0, 160) + '...',
      category: 'General',
      tags: ['Blog'],
      author: 'CyberAiSecure',
      readTime: '3 min read',
      content: trimmed,
    };
  }

  const parts = trimmed.split(/^---$/m);
  if (parts.length < 3) {
    return null;
  }

  const frontmatterStr = parts[1];
  const bodyContent = parts.slice(2).join('---').trim();

  // Extract frontmatter key-values
  const metadata: Record<string, any> = {};
  const lines = frontmatterStr.split('\n');

  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim();

    // Remove quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }

    // Parse arrays e.g. ["tag1", "tag2"] or tag1, tag2
    if (val.startsWith('[') && val.endsWith(']')) {
      metadata[key] = val.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
    } else if (val === 'true') {
      metadata[key] = true;
    } else if (val === 'false') {
      metadata[key] = false;
    } else {
      metadata[key] = val;
    }
  }

  // Calculate reading time based on word count
  const words = bodyContent.split(/\s+/).filter(Boolean).length;
  const readTime = `${Math.max(1, Math.ceil(words / 200))} min read`;

  const fallbackSlug = fallbackId.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  return {
    id: fallbackId,
    title: metadata.title || fallbackId.replace(/-/g, ' '),
    slug: metadata.slug || fallbackSlug,
    date: metadata.date || 'Recent',
    excerpt: metadata.excerpt || metadata.description || bodyContent.slice(0, 150).replace(/[#*`]/g, '') + '...',
    category: metadata.category || 'General',
    tags: Array.isArray(metadata.tags) ? metadata.tags : (metadata.tags ? [metadata.tags] : ['CyberAiSecure']),
    author: metadata.author || 'CyberAiSecure Editorial',
    readTime: metadata.readTime || readTime,
    featured: Boolean(metadata.featured),
    draft: Boolean(metadata.draft),
    content: bodyContent,
  };
}

// Automatically load all .md files from /content/posts using Vite's glob import
export function loadAllMarkdownPosts(): BlogPost[] {
  // Vite import.meta.glob with raw content query
  const files = import.meta.glob<string>('/content/posts/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  });

  const posts: BlogPost[] = [];

  for (const path in files) {
    // Derive ID from filename e.g. /content/posts/my-post.md -> my-post
    const filename = path.split('/').pop()?.replace(/\.md$/, '') || 'post';

    // Skip the template file from live feed listings
    if (filename === 'template' || filename === 'blog-template') {
      continue;
    }

    const raw = files[path];
    if (typeof raw === 'string') {
      const parsed = parseMarkdown(raw, filename);
      if (parsed && !parsed.draft) {
        posts.push(parsed);
      }
    }
  }

  // Sort by date descending
  return posts.sort((a, b) => (b.date > a.date ? 1 : -1));
}
