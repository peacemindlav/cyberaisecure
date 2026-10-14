import React, { useState } from 'react';
import { 
  X, ArrowLeft, Clock, Share2, Check, Copy, AlertTriangle, 
  Tag, ExternalLink, ShieldCheck, Terminal 
} from 'lucide-react';
import { NewsArticle } from '../types';

interface ArticleModalProps {
  article: NewsArticle | null;
  onClose: () => void;
  onSelectRelated: (article: NewsArticle) => void;
  allArticles: NewsArticle[];
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  onClose,
  onSelectRelated,
  allArticles,
}) => {
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [urlCopied, setUrlCopied] = useState(false);

  if (!article) return null;

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  };

  const related = allArticles
    .filter(a => a.id !== article.id && (a.category === article.category || a.tags.some(t => article.tags.includes(t))))
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 dark:bg-black/80 backdrop-blur-sm flex justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0f141f] rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Sticky Modal Header */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-[#0f141f]/95 backdrop-blur border-b border-slate-100 dark:border-slate-800 px-6 py-3.5 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Stories</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-2.5 py-1 text-xs font-mono rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy Story Link"
            >
              {urlCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{urlCopied ? 'Link Copied' : 'Share'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Story Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Metadata Kicker */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="font-bold text-[#d92338] tracking-wider uppercase">
              {article.category}
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {article.publishedAt}
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-slate-500 dark:text-slate-400">{article.readTime}</span>
            {article.cveId && (
              <>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {article.cveId} {article.cvss ? `(CVSS ${article.cvss})` : ''}
                </span>
              </>
            )}
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight font-sans">
            {article.title}
          </h1>

          {/* Author & Verification Card */}
          <div className="py-3 border-y border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <div>
              Reported by <strong className="text-slate-800 dark:text-slate-200">{article.author}</strong>
            </div>
            <div>
              Primary Source: <span className="text-slate-700 dark:text-slate-300">{article.source}</span>
            </div>
          </div>

          {/* Summary Lead Box */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border-l-4 border-[#d92338] text-sm text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
            {article.summary}
          </div>

          {/* Render Story Content with Code Blocks */}
          <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 font-sans leading-relaxed text-sm sm:text-base space-y-4">
            {renderFormattedContent(article.content, handleCopyCode, copiedCodeId)}
          </div>

          {/* Tag Cloud */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1 mr-1">
              <Tag className="w-3.5 h-3.5" /> Filed Under:
            </span>
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-[#d92338] transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Related Stories */}
          {related.length > 0 && (
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                Related Threat Coverage
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {related.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectRelated(rel)}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-900/40 cursor-pointer transition-all"
                  >
                    <span className="text-[10px] font-mono text-[#d92338] dark:text-rose-400 font-bold uppercase">
                      {rel.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 mt-1">
                      {rel.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      {rel.publishedAt}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Formatted content parser with syntax-highlighted code blocks
function renderFormattedContent(
  text: string, 
  handleCopyCode: (code: string, id: string) => void,
  copiedCodeId: string | null
) {
  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith('```')) {
      const firstLineBreak = part.indexOf('\n');
      const language = part.slice(3, firstLineBreak).trim() || 'text';
      const code = part.slice(firstLineBreak + 1, part.lastIndexOf('```')).trim();
      const codeId = `modal-code-${index}`;

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

          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={pIdx} className="text-lg font-bold text-slate-900 dark:text-white mt-5 mb-2 font-sans">
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
