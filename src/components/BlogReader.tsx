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
            {renderInlineMarkdown(post.excerpt)}
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

// Recursive inline markdown parser for bold, italic, inline code, and links
function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  // Pattern matches:
  // 1. `inline code`
  // 2. **bold** or __bold__
  // 3. [link label](url)
  // 4. *italic* or _italic_
  const regex = /(`[^`]+`|\*\*[^*]+?\*\*|__[^_]+?__|\[[^\]]+\]\([^)]+\)|\*[^\s*][^*]*?\*|_[^\s_][^_]*?_)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Inline code: `...`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#d92338] dark:text-rose-400 font-mono text-xs border border-slate-200 dark:border-slate-700/80"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Bold: **...** or __...__
    if (
      (part.startsWith('**') && part.endsWith('**') && part.length >= 4) ||
      (part.startsWith('__') && part.endsWith('__') && part.length >= 4)
    ) {
      const inner = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold text-slate-950 dark:text-white">
          {renderInlineMarkdown(inner)}
        </strong>
      );
    }

    // Link: [label](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      return (
        <a
          key={index}
          href={href}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="text-[#d92338] dark:text-rose-400 underline underline-offset-2 hover:opacity-80 transition-opacity font-medium"
        >
          {label}
        </a>
      );
    }

    // Italic: *...* or _..._
    if (
      (part.startsWith('*') && part.endsWith('*') && part.length >= 2) ||
      (part.startsWith('_') && part.endsWith('_') && part.length >= 2)
    ) {
      return (
        <em key={index} className="italic text-slate-800 dark:text-slate-200">
          {part.slice(1, -1)}
        </em>
      );
    }

    // Plain text
    return part;
  });
}

// Formatted content parser with code blocks, tables, lists, and typography
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
        <div key={index} className="my-5 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 text-xs font-mono shadow-xs">
          <div className="bg-slate-900 px-3.5 py-1.5 flex items-center justify-between text-slate-400 border-b border-slate-800 text-[11px]">
            <span className="uppercase font-semibold tracking-wider text-slate-300">{language}</span>
            <button
              onClick={() => handleCopyCode(code, codeId)}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            >
              {copiedCodeId === codeId ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 overflow-x-auto text-slate-200 leading-relaxed font-mono text-xs">
            <code>{code}</code>
          </pre>
        </div>
      );
    }

    const paragraphs = part.split(/\n\n+/);
    return (
      <React.Fragment key={index}>
        {paragraphs.map((p, pIdx) => {
          const trimmed = p.trim();
          if (!trimmed) return null;

          // Headings
          if (trimmed.startsWith('# ')) {
            return (
              <h1 key={pIdx} className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-8 mb-3 tracking-tight">
                {renderInlineMarkdown(trimmed.replace(/^#\s+/, ''))}
              </h1>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h2 key={pIdx} className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-3 pb-1 border-b border-slate-200 dark:border-slate-800 tracking-tight">
                {renderInlineMarkdown(trimmed.replace(/^##\s+/, ''))}
              </h2>
            );
          }
          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={pIdx} className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-6 mb-2 tracking-tight">
                {renderInlineMarkdown(trimmed.replace(/^###\s+/, ''))}
              </h3>
            );
          }
          if (trimmed.startsWith('#### ')) {
            return (
              <h4 key={pIdx} className="text-base font-bold text-slate-900 dark:text-white mt-5 mb-2">
                {renderInlineMarkdown(trimmed.replace(/^####\s+/, ''))}
              </h4>
            );
          }

          // Horizontal rule
          if (trimmed === '---' || trimmed === '***') {
            return <hr key={pIdx} className="border-slate-200 dark:border-slate-800 my-8" />;
          }

          // Blockquotes
          if (trimmed.startsWith('>')) {
            const quoteContent = trimmed
              .split('\n')
              .map(line => line.replace(/^>\s?/, ''))
              .join(' ');
            return (
              <blockquote
                key={pIdx}
                className="border-l-4 border-[#d92338] pl-4 py-2 my-4 bg-slate-100/70 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 italic text-sm sm:text-base rounded-r-lg"
              >
                {renderInlineMarkdown(quoteContent)}
              </blockquote>
            );
          }

          // Markdown Table (| Col 1 | Col 2 |)
          if (trimmed.includes('|') && trimmed.split('\n').some(l => l.includes('---'))) {
            const tableLines = trimmed
              .split('\n')
              .map(l => l.trim())
              .filter(Boolean);
            if (tableLines.length >= 2) {
              const parseRow = (row: string) =>
                row
                  .split('|')
                  .map(c => c.trim())
                  .filter((c, idx, arr) => !(idx === 0 && c === '') && !(idx === arr.length - 1 && c === ''));

              const headers = parseRow(tableLines[0]);
              const bodyRows = tableLines.slice(2).map(parseRow);

              return (
                <div key={pIdx} className="my-6 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 font-mono uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        {headers.map((h, hIdx) => (
                          <th key={hIdx} className="px-4 py-3 font-semibold">
                            {renderInlineMarkdown(h)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {bodyRows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="px-4 py-3 text-slate-700 dark:text-slate-300 leading-normal">
                              {renderInlineMarkdown(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }
          }

          // Unordered Lists (- or *)
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const listItems = trimmed
              .split('\n')
              .map(li => li.replace(/^[-*]\s+/, '').trim())
              .filter(Boolean);
            return (
              <ul key={pIdx} className="list-disc list-outside ml-5 space-y-2 my-4 text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                {listItems.map((item, liIdx) => (
                  <li key={liIdx}>{renderInlineMarkdown(item)}</li>
                ))}
              </ul>
            );
          }

          // Numbered Lists (1., 2.)
          if (/^\d+\.\s/.test(trimmed)) {
            const listItems = trimmed
              .split('\n')
              .map(li => li.replace(/^\d+\.\s+/, '').trim())
              .filter(Boolean);
            return (
              <ol key={pIdx} className="list-decimal list-outside ml-5 space-y-2 my-4 text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                {listItems.map((item, liIdx) => (
                  <li key={liIdx}>{renderInlineMarkdown(item)}</li>
                ))}
              </ol>
            );
          }

          // Standard Paragraphs with bold, italics, inline code, and links
          return (
            <p key={pIdx} className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base my-3.5">
              {renderInlineMarkdown(trimmed)}
            </p>
          );
        })}
      </React.Fragment>
    );
  });
}
