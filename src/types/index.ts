export type Category = 
  | 'All Stories'
  | 'Vulnerabilities'
  | 'Malware'
  | 'Data Breaches'
  | 'Cyber Warfare'
  | 'Cloud Security'
  | 'AI & LLM';

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: Exclude<Category, 'All Stories'>;
  publishedAt: string;
  readTime: string;
  author: string;
  source: string;
  cveId?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  cvss?: number;
  featured?: boolean;
  content: string;
  tags: string[];
}

export interface CVEBullet {
  cveId: string;
  score: number;
  description: string;
  target: string;
  status: string;
}
