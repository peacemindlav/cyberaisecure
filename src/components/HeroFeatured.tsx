import React from 'react';
import { ArrowRight, AlertTriangle, ShieldAlert, Clock, ExternalLink } from 'lucide-react';
import { NewsArticle } from '../types';

interface HeroFeaturedProps {
  article: NewsArticle;
  onSelect: (article: NewsArticle) => void;
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = ({ article, onSelect }) => {
  return (
    <article 
      onClick={() => onSelect(article)}
      className="group cursor-pointer bg-white dark:bg-[#121824] rounded-lg border border-slate-200 dark:border-slate-800 p-6 sm:p-8 hover:border-slate-400 dark:hover:border-slate-700 transition-all shadow-sm hover:shadow-md mb-8"
    >
      <div className="flex flex-col gap-3">
        {/* Kicker metadata line (Zero-Pill discipline) */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="font-bold text-[#d92338] tracking-wider uppercase">
            {article.category}
          </span>
          <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {article.publishedAt}
          </span>
          <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
          <span className="text-slate-500 dark:text-slate-400">{article.readTime}</span>
          {article.cveId && (
            <>
              <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
              <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {article.cveId} {article.cvss ? `(CVSS ${article.cvss})` : ''}
              </span>
            </>
          )}
        </div>

        {/* Lead Headline */}
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white group-hover:text-[#d92338] dark:group-hover:text-rose-400 transition-colors leading-tight">
          {article.title}
        </h1>

        {/* Lead Summary */}
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-sans line-clamp-3">
          {article.summary}
        </p>

        {/* Lead Footer */}
        <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>By <strong className="font-semibold text-slate-800 dark:text-slate-200">{article.author}</strong></span>
            <span>·</span>
            <span>Source: {article.source}</span>
          </div>

          <div className="text-[#d92338] dark:text-rose-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>Read Full Dispatch</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </article>
  );
};
