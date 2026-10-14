import React from 'react';
import { ArrowUpRight, Clock, AlertTriangle } from 'lucide-react';
import { NewsArticle } from '../types';

interface ArticleCardProps {
  article: NewsArticle;
  onSelect: (article: NewsArticle) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onSelect }) => {
  return (
    <article 
      onClick={() => onSelect(article)}
      className="group cursor-pointer bg-white dark:bg-[#121824] rounded-lg border border-slate-200 dark:border-slate-800 p-5 hover:border-slate-400 dark:hover:border-slate-700 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
    >
      <div>
        {/* Unboxed Metadata Header (Zero Pills) */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono mb-2">
          <span className="font-bold text-[#d92338] tracking-wider uppercase">
            {article.category}
          </span>
          <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {article.publishedAt}
          </span>
          {article.cveId && (
            <>
              <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
              <span className="text-rose-600 dark:text-rose-400 font-medium">
                {article.cveId}
              </span>
            </>
          )}
        </div>

        {/* Article Headline */}
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#d92338] dark:group-hover:text-rose-400 transition-colors leading-snug mb-2 font-sans">
          {article.title}
        </h2>

        {/* Excerpt */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans line-clamp-2 mb-4">
          {article.summary}
        </p>
      </div>

      {/* Card Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
        <div className="flex items-center gap-2 truncate">
          <span>{article.readTime}</span>
          <span>·</span>
          <span className="truncate">{article.source}</span>
        </div>
        <div className="text-slate-400 group-hover:text-[#d92338] dark:group-hover:text-rose-400 transition-colors flex items-center gap-0.5 shrink-0 ml-2">
          <span>Read</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </article>
  );
};
