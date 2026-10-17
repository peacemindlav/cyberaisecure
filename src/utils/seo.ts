/**
 * Client-side SEO & Social Meta Tag Sync
 * Dynamically updates document.title, canonical links, OpenGraph, Twitter, and Schema.org JSON-LD
 */

export function updatePageSEO(post?: {
  title: string;
  excerpt: string;
  slug: string;
  date?: string;
  author?: string;
  category?: string;
  tags?: string[];
}) {
  if (typeof document === 'undefined') return;

  const siteTitle = 'CyberAiSecure | Architecture, Engineering & AI Security';
  const siteDesc = 'Architectural blueprints, AI vulnerabilities, supply chain defense, and cloud security engineering guides.';
  const baseUrl = 'https://cyberaisecure.com';

  const title = post ? `${post.title} | CyberAiSecure` : siteTitle;
  const description = post ? post.excerpt : siteDesc;
  const url = post ? `${baseUrl}/posts/${post.slug}` : `${baseUrl}/`;

  // Title
  document.title = title;

  // Meta helper
  const setMeta = (nameOrProperty: string, content: string, isProperty = false) => {
    const attr = isProperty ? 'property' : 'name';
    let el = document.querySelector(`meta[${attr}="${nameOrProperty}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, nameOrProperty);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMeta('description', description);
  setMeta('og:title', title, true);
  setMeta('og:description', description, true);
  setMeta('og:url', url, true);
  setMeta('og:type', post ? 'article' : 'website', true);
  setMeta('og:site_name', 'CyberAiSecure', true);
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', title);
  setMeta('twitter:description', description);

  if (post && post.date) {
    setMeta('article:published_time', post.date, true);
  }
  if (post && post.author) {
    setMeta('article:author', post.author, true);
  }
  if (post && post.category) {
    setMeta('article:section', post.category, true);
  }

  // Canonical tag
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', url);

  // Schema.org JSON-LD
  let jsonLd = document.getElementById('schema-json-ld');
  if (!jsonLd) {
    jsonLd = document.createElement('script');
    jsonLd.id = 'schema-json-ld';
    jsonLd.setAttribute('type', 'application/ld+json');
    document.head.appendChild(jsonLd);
  }

  if (post) {
    jsonLd.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date || new Date().toISOString().split('T')[0],
      dateModified: post.date || new Date().toISOString().split('T')[0],
      author: {
        '@type': 'Person',
        name: post.author || 'CyberAiSecure Editorial Desk',
      },
      publisher: {
        '@type': 'Organization',
        name: 'CyberAiSecure',
        url: baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/logo.png`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url,
      },
      keywords: post.tags ? post.tags.join(', ') : undefined,
    });
  } else {
    jsonLd.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'CyberAiSecure',
      url: `${baseUrl}/`,
      description: siteDesc,
      publisher: {
        '@type': 'Organization',
        name: 'CyberAiSecure',
        url: `${baseUrl}/`,
      },
    });
  }
}
