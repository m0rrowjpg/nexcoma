import React, { useRef, useEffect } from 'react';
import { Search, X, Sparkles, Command } from 'lucide-react';

interface HeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  resultCount: number;
  totalCount: number;
  onSelectSuggestion: (term: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  searchQuery,
  setSearchQuery,
  resultCount,
  totalCount,
  onSelectSuggestion,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement !== searchInputRef.current &&
        !['input', 'textarea'].includes((document.activeElement?.tagName || '').toLowerCase())
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const popularSearches = ['Cursor', 'n8n automation', 'Local LLMs', 'Code editor', 'Perplexity', 'Free tier'];

  return (
    <section className="relative overflow-hidden border-b border-neutral-200/70 bg-gradient-to-b from-white via-neutral-50/50 to-neutral-50 px-4 pt-12 pb-14 sm:px-6 lg:px-8 dark:border-neutral-800/70 dark:from-[#0A0A0C] dark:via-[#0F0F14]/40 dark:to-[#0A0A0C]">
      <div className="mx-auto max-w-5xl text-center">
        {/* Subtle Brand Tagline */}
        <div className="mb-4 inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs font-medium text-purple-700 dark:text-purple-300">
          <span>Curated Utility & Intelligence Directory</span>
          <span aria-hidden="true" className="hidden sm:inline text-neutral-300 dark:text-neutral-700">·</span>
          <span className="hidden sm:inline">Verified 2026 Editions</span>
        </div>

        {/* Large Hero Headline */}
        <h1 className="text-balance text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl dark:text-white">
          Discover smarter ways to work.
        </h1>

        {/* Supporting description */}
        <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-600 sm:text-lg dark:text-neutral-400">
          Nexcoma is an independent, rigorously evaluated directory of AI tools,
          developer IDEs, automation engines, and utilities built for modern velocity.
        </p>

        {/* Prominent Search Bar */}
        <div className="mx-auto mt-8 max-w-2xl">
          <div className="relative flex items-center rounded-2xl border border-neutral-300/80 bg-white p-2 shadow-sm transition-all focus-within:border-purple-600 focus-within:ring-3 focus-within:ring-purple-500/15 dark:border-neutral-700 dark:bg-[#121216] dark:focus-within:border-purple-500">
            <div className="flex h-11 w-11 items-center justify-center text-neutral-400 dark:text-neutral-500 shrink-0">
              <Search className="h-5 w-5" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by tool name, capability (e.g. 'code', 'audio', 'pipeline'), or pricing..."
              className="w-full bg-transparent pr-3 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none dark:text-white dark:placeholder-neutral-500"
              aria-label="Search AI tools and software"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mr-1.5 flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                aria-label="Clear search input"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <div className="hidden sm:flex items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-100/80 px-2 py-1 text-[11px] font-medium text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-400 shrink-0">
              <span className="font-mono">/</span>
            </div>
          </div>

          {/* Quick popular suggestion tags */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="font-medium text-neutral-400 dark:text-neutral-500">Popular:</span>
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => onSelectSuggestion(term)}
                className="rounded-md border border-neutral-200/80 bg-white px-2 py-1 transition-colors hover:border-purple-300 hover:text-purple-600 dark:border-neutral-800 dark:bg-[#141418] dark:hover:border-purple-800 dark:hover:text-purple-300"
              >
                {term}
              </button>
            ))}
          </div>

          {/* Results feedback banner if searching */}
          {searchQuery && (
            <div className="mt-4 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
              <span>
                Showing <strong className="font-semibold text-neutral-900 dark:text-white">{resultCount}</strong> of {totalCount} verified tools for &ldquo;{searchQuery}&rdquo;
              </span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-purple-600 hover:underline dark:text-purple-400"
              >
                Reset search
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
