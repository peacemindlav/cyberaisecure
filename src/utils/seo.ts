/**
 * Client-side SEO & Social Meta Tag Sync
 * Dynamically updates document.title, canonical links, OpenGraph, Twitter, and Schema.org JSON-LD
 */

export function updatePageSEO(
  post?: {
    title: string;
    seoTitle?: string;
    excerpt: string;
    slug: string;
    date?: string;
    author?: string;
    category?: string;
    tags?: string[];
  },
  selectedCategory?: string
) {
  if (typeof document === 'undefined') return;

  const baseUrl = 'https://cyberaisecure.com';
  const defaultImage = `${baseUrl}/og-default.png`;
  const siteTitle = 'AI & Cloud Security Engineering | CyberAiSecure';
  const siteDesc =
    'Technical engineering publication on artificial intelligence security, LLM vulnerabilities, cloud defense architectures, and zero-trust systems.';

  let title = siteTitle;
  let description = siteDesc;
  let url = `${baseUrl}/`;

  if (post) {
    const rawShort = post.seoTitle || post.title;
    const truncated = rawShort.length > 45 ? `${rawShort.slice(0, 42).trim()}...` : rawShort;
    title = `${truncated} | CyberAiSecure`;
    description = post.excerpt;
    url = `${baseUrl}/posts/${post.slug}/`;
  } else if (selectedCategory && selectedCategory !== 'All') {
    const catSlug = selectedCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (catSlug === 'cve-info') {
      title = 'CVE Info & Vulnerability Guides | CyberAiSecure';
      description = 'Critical CVE advisories, remote code execution mitigations, and emergency server hardening guides.';
    } else if (catSlug === 'security-insights') {
      title = 'Security Insights & Blueprints | CyberAiSecure';
      description = 'Architectural blueprints for AI security, OWASP LLM risks, zero-trust networking, and post-quantum readiness.';
    } else {
      title = `${selectedCategory.slice(0, 45)} | CyberAiSecure`;
    }
    url = `${baseUrl}/category/${catSlug}/`;
  }

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
  setMeta('og:image', defaultImage, true);
  setMeta('og:site_name', 'CyberAiSecure', true);
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', title);
  setMeta('twitter:description', description);
  setMeta('twitter:image', defaultImage);

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
      url,
      image: defaultImage,
      datePublished: post.date || new Date().toISOString().split('T')[0],
      dateModified: post.date || new Date().toISOString().split('T')[0],
      author: {
        '@type': 'Person',
        name: post.author || 'CyberAiSecure Team',
      },
      publisher: {
        '@type': 'Organization',
        name: 'CyberAiSecure',
        url: `${baseUrl}/`,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/logo.svg`,
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
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${baseUrl}/#website`,
          name: 'CyberAiSecure',
          url: `${baseUrl}/`,
          description: siteDesc,
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${baseUrl}/?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
          publisher: {
            '@type': 'Organization',
            name: 'CyberAiSecure',
            url: `${baseUrl}/`,
            logo: {
              '@type': 'ImageObject',
              url: `${baseUrl}/logo.svg`,
            },
          },
        },
      ],
    });
  }
}
