import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Monitor,
  Bookmark,
  Plus,
  Menu,
  X,
  Scale,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSavedTools } from '../context/SavedToolsContext';

interface NavbarProps {
  activeTab: 'discover' | 'categories' | 'compare' | 'guides' | 'about';
  setActiveTab: (tab: 'discover' | 'categories' | 'compare' | 'guides' | 'about') => void;
  onOpenSubmitModal: () => void;
  onOpenSavedDrawer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSubmitModal,
  onOpenSavedDrawer,
}) => {
  const { mode, isDark, setMode } = useTheme();
  const { savedIds } = useSavedTools();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const handleNavClick = (
    tab: 'discover' | 'categories' | 'compare' | 'guides' | 'about'
  ) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/80 backdrop-blur-md dark:border-neutral-800/80 dark:bg-[#0A0A0C]/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => handleNavClick('discover')}
          className="group flex items-center gap-2.5 text-left text-lg font-bold tracking-tight text-neutral-900 transition-opacity hover:opacity-90 dark:text-white shrink-0"
          aria-label="Nexcoma Homepage"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white shadow-xs dark:bg-purple-600 dark:text-white">
            <span className="font-mono text-sm font-semibold tracking-tighter">NX</span>
          </div>
          <span className="font-bold tracking-tight">Nexcoma</span>
        </button>

        {/* Zone 2: 4-5 single-line clean text links */}
        <nav className="hidden items-center gap-7 md:flex text-sm font-medium text-neutral-600 dark:text-neutral-300">
          <button
            onClick={() => handleNavClick('discover')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-neutral-900 dark:hover:text-white ${
              activeTab === 'discover'
                ? 'font-semibold text-purple-600 dark:text-purple-400'
                : ''
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => handleNavClick('categories')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-neutral-900 dark:hover:text-white ${
              activeTab === 'categories'
                ? 'font-semibold text-purple-600 dark:text-purple-400'
                : ''
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => handleNavClick('compare')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1.5 ${
              activeTab === 'compare'
                ? 'font-semibold text-purple-600 dark:text-purple-400'
                : ''
            }`}
          >
            <Scale className="h-3.5 w-3.5" />
            <span>Compare</span>
          </button>
          <button
            onClick={() => handleNavClick('guides')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-neutral-900 dark:hover:text-white ${
              activeTab === 'guides'
                ? 'font-semibold text-purple-600 dark:text-purple-400'
                : ''
            }`}
          >
            Guides
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-neutral-900 dark:hover:text-white ${
              activeTab === 'about'
                ? 'font-semibold text-purple-600 dark:text-purple-400'
                : ''
            }`}
          >
            About
          </button>
        </nav>

        {/* Zone 3: Actions (Theme switcher, Saved drawer, Submit CTA) */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Saved Tools Trigger */}
          <button
            onClick={onOpenSavedDrawer}
            className="relative flex h-9 items-center gap-1.5 rounded-lg border border-neutral-200/90 px-2.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800/80 dark:hover:text-white"
            title="Saved Tools"
            aria-label={`Saved Tools (${savedIds.length})`}
          >
            <Bookmark className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            <span className="hidden sm:inline">Saved</span>
            {savedIds.length > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-purple-600 px-1 font-mono text-[10px] font-semibold text-white">
                {savedIds.length}
              </span>
            )}
          </button>

          {/* Theme switcher dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200/90 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800/80 dark:hover:text-white"
              aria-label="Toggle theme appearance"
            >
              {isDark ? (
                <Moon className="h-4 w-4 text-purple-400" />
              ) : (
                <Sun className="h-4 w-4 text-amber-500" />
              )}
            </button>

            {showThemeMenu && (
              <div
                className="absolute right-0 mt-2 w-36 rounded-xl border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-800 dark:bg-[#141418] z-50 animate-in fade-in zoom-in-95 duration-100"
                role="menu"
              >
                <button
                  onClick={() => {
                    setMode('light');
                    setShowThemeMenu(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                    mode === 'light'
                      ? 'bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-white'
                      : 'text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800/60'
                  }`}
                >
                  <Sun className="h-3.5 w-3.5 text-amber-500" />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => {
                    setMode('dark');
                    setShowThemeMenu(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                    mode === 'dark'
                      ? 'bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-white'
                      : 'text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800/60'
                  }`}
                >
                  <Moon className="h-3.5 w-3.5 text-purple-400" />
                  <span>Dark</span>
                </button>
                <button
                  onClick={() => {
                    setMode('system');
                    setShowThemeMenu(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                    mode === 'system'
                      ? 'bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-white'
                      : 'text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800/60'
                  }`}
                >
                  <Monitor className="h-3.5 w-3.5 text-neutral-500" />
                  <span>System</span>
                </button>
              </div>
            )}
          </div>

          {/* Primary Action Button - Hidden on mobile, visible on desktop */}
          <button
            onClick={onOpenSubmitModal}
            className="hidden sm:flex h-9 items-center gap-1.5 rounded-lg bg-neutral-900 px-3 text-xs font-semibold text-white shadow-xs transition-all hover:bg-neutral-800 dark:bg-purple-600 dark:hover:bg-purple-500 whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Submit Tool</span>
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 md:hidden dark:border-neutral-800 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-neutral-200 bg-white px-4 py-4 md:hidden dark:border-neutral-800 dark:bg-[#0E0E12]">
          <nav className="flex flex-col gap-2 text-sm font-medium">
            <button
              onClick={() => handleNavClick('discover')}
              className={`flex items-center rounded-lg px-3 py-2 text-left transition-colors ${
                activeTab === 'discover'
                  ? 'bg-purple-50 font-semibold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                  : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
              }`}
            >
              Discover
            </button>
            <button
              onClick={() => handleNavClick('categories')}
              className={`flex items-center rounded-lg px-3 py-2 text-left transition-colors ${
                activeTab === 'categories'
                  ? 'bg-purple-50 font-semibold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                  : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => handleNavClick('compare')}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors ${
                activeTab === 'compare'
                  ? 'bg-purple-50 font-semibold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                  : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
              }`}
            >
              <Scale className="h-4 w-4" />
              <span>Compare Tools</span>
            </button>
            <button
              onClick={() => handleNavClick('guides')}
              className={`flex items-center rounded-lg px-3 py-2 text-left transition-colors ${
                activeTab === 'guides'
                  ? 'bg-purple-50 font-semibold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                  : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
              }`}
            >
              Guides & Tutorials
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className={`flex items-center rounded-lg px-3 py-2 text-left transition-colors ${
                activeTab === 'about'
                  ? 'bg-purple-50 font-semibold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                  : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
              }`}
            >
              About & Methodology
            </button>
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSubmitModal();
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                <span>Submit a Tool</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
