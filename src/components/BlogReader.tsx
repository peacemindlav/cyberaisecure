import React, { useState } from 'react';
import { ArrowLeft, Clock, Calendar, Share2, Check, Copy, Tag, User } from 'lucide-react';
import { BlogPost } from '../types';

interface BlogReaderProps {
  post: BlogPost;
  onBack: () => void;
}

export const BlogReader: React.FC<BlogReaderProps> = ({ post, onBack }) => {
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [urlCopied, setUrlCopied] = useState(false);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 font-sans">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Posts</span>
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono transition-colors cursor-pointer"
        >
          {urlCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{urlCopied ? 'Link Copied!' : 'Share Post'}</span>
        </button>
      </div>

      {/* Article Header */}
      <header className="space-y-4 mb-8">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
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

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          {post.title}
        </h1>

        <div className="py-3 border-y border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <User className="w-4 h-4 text-[#d92338]" />
          <span>Published by <strong className="text-slate-800 dark:text-slate-200">{post.author}</strong></span>
        </div>

        {/* Lead Excerpt Box */}
        {post.excerpt && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border-l-4 border-[#d92338] text-sm text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
            {post.excerpt}
          </div>
        )}
      </header>

      {/* Markdown Content Body */}
      <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed space-y-4 font-sans">
        {renderMarkdownContent(post.content, handleCopyCode, copiedCodeId)}
      </div>

      {/* Tags Footer */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1 mr-1">
            <Tag className="w-3.5 h-3.5" /> Topics:
          </span>
          {post.tags.map(t => (
            <span key={t} className="text-xs font-mono text-slate-600 dark:text-slate-400">
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Back Button */}
      <div className="mt-8 text-center">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Blog Posts</span>
        </button>
      </div>
    </article>
  );
};

// Formatted content parser with syntax-highlighted code blocks
function renderMarkdownContent(
  text: string, 
  handleCopyCode: (code: string, id: string) => void,
  copiedCodeId: string | null
) {
  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith('```')) {
      const firstLineBreak = part.indexOf('\n');
      const language = part.slice(3, firstLineBreak).trim() || 'bash';
      const code = part.slice(firstLineBreak + 1, part.lastIndexOf('```')).trim();
      const codeId = `blog-code-${index}`;

      return (
        <div key={index} className="my-4 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 text-xs font-mono">
          <div className="bg-slate-900 px-3 py-1.5 flex items-center justify-between text-slate-400 border-b border-slate-800 text-[11px]">
            <span className="uppercase">{language}</span>
            <button
              onClick={() => handleCopyCode(code, codeId)}
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
            >
              {copiedCodeId === codeId ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 overflow-x-auto text-slate-200 leading-relaxed font-mono">
            <code>{code}</code>
          </pre>
        </div>
      );
    }

    const paragraphs = part.split('\n\n');
    return (
      <React.Fragment key={index}>
        {paragraphs.map((p, pIdx) => {
          const trimmed = p.trim();
          if (!trimmed) return null;

          if (trimmed.startsWith('# ')) {
            return (
              <h1 key={pIdx} className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-6 mb-3">
                {trimmed.replace('# ', '')}
              </h1>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h2 key={pIdx} className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-6 mb-2">
                {trimmed.replace('## ', '')}
              </h2>
            );
          }
          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={pIdx} className="text-lg font-bold text-slate-900 dark:text-white mt-5 mb-2">
                {trimmed.replace('### ', '')}
              </h3>
            );
          }
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const listItems = trimmed.split('\n').map(li => li.replace(/^[-*]\s+/, ''));
            return (
              <ul key={pIdx} className="list-disc list-inside space-y-1.5 my-3 text-slate-700 dark:text-slate-300 text-sm">
                {listItems.map((item, liIdx) => (
                  <li key={liIdx}>{item}</li>
                ))}
              </ul>
            );
          }
          return (
            <p key={pIdx} className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base my-3">
              {trimmed}
            </p>
          );
        })}
      </React.Fragment>
    );
  });
}
