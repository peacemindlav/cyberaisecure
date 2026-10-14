import React from 'react';
import { Clock, Calendar, ArrowRight, Tag } from 'lucide-react';
import { BlogPost } from '../types';

interface BlogCardProps {
  post: BlogPost;
  onSelect: (post: BlogPost) => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post, onSelect }) => {
  return (
    <article 
      onClick={() => onSelect(post)}
      className="group cursor-pointer bg-white dark:bg-[#121824] rounded-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 hover:border-slate-400 dark:hover:border-slate-700 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
    >
      <div>
        {/* Metadata Header */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono mb-2.5">
          <span className="font-bold text-[#d92338] tracking-wider uppercase">
            {post.category}
          </span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {post.date}
          </span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {post.readTime}
          </span>
        </div>

        {/* Blog Title */}
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-[#d92338] dark:group-hover:text-rose-400 transition-colors leading-snug mb-2.5 font-sans">
          {post.title}
        </h2>

        {/* Excerpt */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans line-clamp-3 mb-4">
          {post.excerpt}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map(t => (
              <span key={t} className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div>
          By <strong className="text-slate-800 dark:text-slate-200">{post.author}</strong>
        </div>
        <div className="text-[#d92338] dark:text-rose-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          <span>Read Article</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </article>
  );
};
