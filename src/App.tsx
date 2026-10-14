/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { HeroFeatured } from './components/HeroFeatured';
import { ArticleCard } from './components/ArticleCard';
import { Sidebar } from './components/Sidebar';
import { ArticleModal } from './components/ArticleModal';
import { Footer } from './components/Footer';
import { DeployModal } from './components/DeployModal';
import { CreateArticleModal } from './components/CreateArticleModal';
import { BUNDLED_ARTICLES, CVE_TRACKER, CATEGORIES_LIST, loadNewsArticles } from './data/news';
import { NewsArticle, Category } from './types';
import { Newspaper, Sparkles, Plus, BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';

export default function App() {
  // Theme Management: Light by Default, Persistent with localStorage
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem('cas_theme');
      return savedTheme === 'dark';
    } catch {
      return false; // Default to Light mode
    }
  });

  const [articles, setArticles] = useState<NewsArticle[]>(BUNDLED_ARTICLES);
  const [selectedCategory, setSelectedCategory] = useState<Category>('All Stories');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [deployModalOpen, setDeployModalOpen] = useState<boolean>(false);
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const feedUrl = './data/news.json';

  // Apply dark class to <html> root whenever theme changes and save to localStorage
  useEffect(() => {
    try {
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('cas_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('cas_theme', 'light');
      }
    } catch {}
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  // Load articles from JSON on initial mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      const data = await loadNewsArticles(feedUrl);
      if (isMounted) {
        setArticles(data);
        setIsLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  const handleRefreshFeed = async () => {
    setIsLoading(true);
    const data = await loadNewsArticles(feedUrl);
    setArticles(data);
    setIsLoading(false);
  };

  const handleAddLocalArticle = (newArticle: NewsArticle) => {
    setArticles(prev => [newArticle, ...prev]);
  };

  // Filtered stories based on category and search
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchCat = 
        selectedCategory === 'All Stories' || art.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch = 
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.summary.toLowerCase().includes(q) ||
        art.tags.some(t => t.toLowerCase().includes(q)) ||
        (art.cveId && art.cveId.toLowerCase().includes(q)) ||
        art.category.toLowerCase().includes(q);

      return matchCat && matchSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  // Featured lead story
  const featuredArticle = useMemo(() => {
    if (filteredArticles.length === 0) return null;
    return filteredArticles.find(a => a.featured) || filteredArticles[0];
  }, [filteredArticles]);

  const feedArticles = useMemo(() => {
    if (!featuredArticle) return [];
    if (selectedCategory === 'All Stories' && !searchQuery) {
      return filteredArticles.filter(a => a.id !== featuredArticle.id);
    }
    return filteredArticles;
  }, [filteredArticles, featuredArticle, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#0c1017] dark:text-slate-100 transition-colors duration-150 font-sans selection:bg-[#d92338]/20 selection:text-[#d92338]">
      {/* Editorial Navigation Header */}
      <Navbar
        currentCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        categories={CATEGORIES_LIST}
        onOpenDeployGuide={() => setDeployModalOpen(true)}
        onOpenCreateArticle={() => setCreateModalOpen(true)}
      />

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Primary News Stream (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Category Header when filtering */}
            {selectedCategory !== 'All Stories' && (
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#d92338]"></span>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase font-mono">
                    {selectedCategory}
                  </h2>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {filteredArticles.length} Stories Filed
                </span>
              </div>
            )}

            {/* Featured Lead Story (When articles exist) */}
            {featuredArticle && selectedCategory === 'All Stories' && !searchQuery && (
              <HeroFeatured
                article={featuredArticle}
                onSelect={(art) => setSelectedArticle(art)}
              />
            )}

            {/* Empty State when no articles exist */}
            {articles.length === 0 ? (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121824] p-8 sm:p-10 shadow-sm text-center">
                <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-[#d92338] dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300 mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Publishing Pipeline Active · All Sample Data Cleaned</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                  Ready for Your First CyberAiSecure Article
                </h2>

                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed mb-6 font-sans">
                  The portal has been cleaned and optimized. You can publish your first article using our interactive SEO builder or by adding entries into <code className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">public/data/news.json</code>.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setCreateModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#d92338] hover:bg-[#b81d2e] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create & SEO-Optimize New Article</span>
                  </button>

                  <button
                    onClick={() => setDeployModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>View GitHub Pages Guide</span>
                  </button>
                </div>

                {/* 3 Quick Publishing Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-100 dark:border-slate-800/80 text-left">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80">
                    <span className="text-[10px] font-mono text-[#d92338] font-bold block mb-1">STEP 01</span>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Compose Title & Summary</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Keep titles between 40–60 chars and summaries between 120–160 chars for Google SERPs.</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80">
                    <span className="text-[10px] font-mono text-[#d92338] font-bold block mb-1">STEP 02</span>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Add to news.json</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Paste the generated JSON entry into <code className="font-mono">public/data/news.json</code>.</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80">
                    <span className="text-[10px] font-mono text-[#d92338] font-bold block mb-1">STEP 03</span>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Push to GitHub</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">GitHub Actions automatically rebuilds and deploys the article live to cyberaisecure.com.</p>
                  </div>
                </div>
              </div>
            ) : feedArticles.length === 0 ? (
              <div className="p-12 text-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121824] shadow-sm">
                <Newspaper className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  No security dispatches found matching &quot;{searchQuery}&quot;
                </h3>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('All Stories'); }}
                  className="mt-3 text-xs font-mono text-[#d92338] hover:underline"
                >
                  Reset News Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-slate-500 pb-2">
                  <span>LATEST SECURITY ADVISORIES</span>
                  <span>{feedArticles.length} ARTICLES</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {feedArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      onSelect={(art) => setSelectedArticle(art)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Clean Editorial Sidebar (Zero Ads) (4 cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <Sidebar
                articles={articles}
                cveTracker={CVE_TRACKER}
                onSelectArticle={(art) => setSelectedArticle(art)}
                onSelectCategory={setSelectedCategory}
                selectedCategory={selectedCategory}
                feedUrl={feedUrl}
                onRefreshFeed={handleRefreshFeed}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Full Article Reader Modal */}
      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onSelectRelated={(art) => setSelectedArticle(art)}
        allArticles={articles}
      />

      {/* Interactive SEO Article Creator Modal */}
      <CreateArticleModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onAddLocalArticle={handleAddLocalArticle}
      />

      {/* GitHub Pages Deployment Guide Modal */}
      <DeployModal
        isOpen={deployModalOpen}
        onClose={() => setDeployModalOpen(false)}
      />

      {/* Editorial Footer */}
      <Footer
        onSelectCategory={setSelectedCategory}
        categories={CATEGORIES_LIST}
        onOpenDeployGuide={() => setDeployModalOpen(true)}
      />
    </div>
  );
}
