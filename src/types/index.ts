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
