import { NewsArticle, CVEBullet } from '../types';

// Clean baseline: all sample blogs removed as requested
export const BUNDLED_ARTICLES: NewsArticle[] = [];

export const CVE_TRACKER: CVEBullet[] = [
  {
    cveId: 'CVE-2026-38411',
    score: 9.4,
    target: 'Autonomous LLM Agent Frameworks',
    description: 'Indirect prompt injection boundary escape & tool hijacking',
    status: 'Advisory Verification Pending'
  },
  {
    cveId: 'CVE-2026-20353',
    score: 9.6,
    target: 'Enterprise Perimeter Edge Firewalls',
    description: 'ROMMON firmware persistence via RPC memory corruption',
    status: 'National Advisory Issued'
  },
  {
    cveId: 'MAL-2026-PYPI',
    score: 8.9,
    target: 'Machine Learning Python Toolchains',
    description: 'Typosquatted packages exfiltrating cloud credentials',
    status: 'IOC Rules Published'
  },
  {
    cveId: 'AML-2026-EVASION',
    score: 8.6,
    target: 'Production Neural Network Classifiers',
    description: 'Fast Gradient Sign Method tensor perturbation evasion',
    status: 'Defense Verification'
  },
  {
    cveId: 'CVE-2026-1182',
    score: 7.8,
    target: 'Kubernetes Ingress-NGINX Controllers',
    description: 'Annotation injection allowing service account token theft',
    status: 'Patch v1.11.2 Available'
  }
];

export const CATEGORIES_LIST = [
  'All Stories',
  'Vulnerabilities',
  'Malware',
  'Data Breaches',
  'Cyber Warfare',
  'Cloud Security',
  'AI & LLM'
] as const;

// Asynchronous loader supporting local JSON or external endpoints
export async function loadNewsArticles(customUrl?: string): Promise<NewsArticle[]> {
  const url = customUrl || './data/news.json';
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return BUNDLED_ARTICLES;
    }
    const data = await response.json();
    return Array.isArray(data) ? data : BUNDLED_ARTICLES;
  } catch {
    return BUNDLED_ARTICLES;
  }
}
