import React, { useState } from 'react';
import { 
  TrendingUp, ShieldAlert, Tag, Mail, CheckCircle2, 
  ExternalLink, Database, RefreshCw, AlertCircle 
} from 'lucide-react';
import { NewsArticle, CVEBullet, Category } from '../types';

interface SidebarProps {
  articles: NewsArticle[];
  cveTracker: CVEBullet[];
  onSelectArticle: (article: NewsArticle) => void;
  onSelectCategory: (category: Category) => void;
  selectedCategory: Category;
  feedUrl: string;
  onRefreshFeed: () => void;
  isLoading: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  articles,
  cveTracker,
  onSelectArticle,
  onSelectCategory,
  selectedCategory,
  feedUrl,
  onRefreshFeed,
  isLoading,
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false);

  const GOOGLE_FORM_ACTION_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScirOBi5wCJFF9Qk5G9p6aM5sElrPOAdGiteDt0ng6g6oH9Xw/formResponse';
  const GOOGLE_FORM_EMAIL_ENTRY_ID = 'entry.349413289';

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@') || isSubmittingNewsletter) return;

    setIsSubmittingNewsletter(true);
    try {
      const formData = new FormData();
      formData.append(GOOGLE_FORM_EMAIL_ENTRY_ID, newsletterEmail);

      await fetch(GOOGLE_FORM_ACTION_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: formData,
      });

      setNewsletterSubmitted(true);
    } catch {
      setNewsletterSubmitted(true);
    } finally {
      setIsSubmittingNewsletter(false);
    }
  };

  // Top trending stories
  const trendingArticles = articles.slice(0, 4);

  return (
    <aside className="w-full space-y-6">
      {/* 1. Trending Stories (Ranked CyberAiSecure Dispatches) */}
      <div className="bg-white dark:bg-[#121824] rounded-lg border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <TrendingUp className="w-4 h-4 text-[#d92338]" />
          <span>Trending Dispatches</span>
        </h3>

        {trendingArticles.length === 0 ? (
          <div className="p-3 text-center rounded bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 text-xs font-mono text-slate-500">
            Awaiting first publication. Published dispatches will rank here.
          </div>
        ) : (
          <div className="space-y-3.5">
            {trendingArticles.map((art, idx) => (
              <div 
                key={art.id} 
                onClick={() => onSelectArticle(art)}
                className="group cursor-pointer flex items-start gap-3 text-xs"
              >
                <span className="font-mono font-extrabold text-base text-slate-300 dark:text-slate-700 group-hover:text-[#d92338] transition-colors leading-none pt-0.5">
                  0{idx + 1}
                </span>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#d92338] dark:text-rose-400 font-semibold uppercase">
                    {art.category}
                  </span>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#d92338] dark:group-hover:text-rose-400 transition-colors leading-snug line-clamp-2">
                    {art.title}
                  </h4>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {art.publishedAt} · {art.readTime}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Active CVE Threat Pulse Index */}
      <div className="bg-white dark:bg-[#121824] rounded-lg border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span>Active CVE Threat Pulse</span>
        </h3>

        <div className="space-y-2.5">
          {cveTracker.map((cve) => (
            <div 
              key={cve.cveId}
              className="p-2.5 rounded bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 text-xs font-mono"
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-bold text-slate-900 dark:text-white">{cve.cveId}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  cve.score >= 9.0 
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400' 
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400'
                }`}>
                  CVSS {cve.score}
                </span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 font-sans font-medium">
                {cve.target}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                <span>{cve.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Security Bulletin Newsletter (Zero Ads) */}
      <div className="bg-slate-900 text-white dark:bg-black rounded-lg border border-slate-800 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2 text-xs font-mono text-cyan-400">
          <Mail className="w-4 h-4 text-[#d92338]" />
          <span className="font-bold">WEEKLY CYBER DIGEST</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed mb-3">
          Get verified zero-day advisories, exploit analysis, and remediation guides delivered directly every Thursday.
        </p>

        {newsletterSubmitted ? (
          <div className="flex items-center gap-2 p-2.5 bg-emerald-950/80 border border-emerald-500/40 rounded text-emerald-300 text-xs font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Subscribed! Check your inbox for confirmation.</span>
          </div>
        ) : (
          <form onSubmit={handleNewsletterSubmit} className="space-y-2">
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="operator@security.corp"
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
            <button
              type="submit"
              disabled={isSubmittingNewsletter}
              className="w-full bg-[#d92338] hover:bg-[#b81d2e] disabled:opacity-75 text-white font-semibold py-2 px-3 rounded text-xs transition-colors cursor-pointer"
            >
              {isSubmittingNewsletter ? 'Connecting...' : 'Subscribe (No Spam)'}
            </button>
          </form>
        )}
      </div>

      {/* 4. Modular Static JSON Feed Source Indicator */}
      <div className="bg-white dark:bg-[#121824] rounded-lg border border-slate-200 dark:border-slate-800 p-4 text-xs font-mono shadow-sm">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="flex items-center gap-1.5 font-bold uppercase text-[10px] text-slate-700 dark:text-slate-300">
            <Database className="w-3.5 h-3.5 text-cyan-500" />
            Feed Architecture
          </span>
          <button
            onClick={onRefreshFeed}
            disabled={isLoading}
            className="flex items-center gap-1 text-[10px] text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Reload</span>
          </button>
        </div>
        <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400 break-all select-all">
          {feedUrl}
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-sans leading-normal">
          Static JSON endpoint ready to be wired to any external RSS or REST API without rebuilding.
        </p>
      </div>
    </aside>
  );
};
