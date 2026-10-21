import React, { useState } from 'react';
import { Send, CheckCircle2, ArrowUpRight } from 'lucide-react';
import type { CategoryMeta, ToolCategory } from '../types';

interface FooterProps {
  categories: CategoryMeta[];
  onSelectCategory: (cat: ToolCategory) => void;
  onOpenSubmitModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  categories,
  onSelectCategory,
  onOpenSubmitModal,
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="border-t border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-[#0A0A0C] text-xs text-neutral-600 dark:text-neutral-400">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Info & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-purple-600">
                <span className="font-mono text-xs font-bold">NX</span>
              </div>
              <span className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">
                Nexcoma
              </span>
            </div>
            <p className="text-xs leading-relaxed max-w-sm text-neutral-500 dark:text-neutral-400">
              Discover smarter ways to work. An independent, curated directory and technical benchmark
              of frontier AI tools, automations, and productivity utilities.
            </p>

            {/* Newsletter input */}
            <div className="pt-2">
              <p className="font-semibold text-neutral-900 dark:text-white text-xs mb-2">
                Weekly Intelligence Digest
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Subscribed! You’ll receive our monthly benchmark.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex max-w-sm items-center gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 focus:border-purple-600 focus:outline-none dark:border-neutral-800 dark:bg-[#141418] dark:text-white"
                  />
                  <button
                    type="submit"
                    className="flex h-8 items-center gap-1 rounded-lg bg-neutral-900 px-3 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-purple-600 dark:hover:bg-purple-500 whitespace-nowrap"
                  >
                    <span>Join</span>
                    <Send className="h-3 w-3" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Directory Categories */}
          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-3 text-xs uppercase tracking-wider">
              Browse Categories
            </h4>
            <ul className="space-y-2">
              {categories.map((category) => (
                  <li key={category.id}>
                    <button
                      onClick={() => onSelectCategory(category.id)}
                      className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      {category.name}
                    </button>
                  </li>
              ))}
            </ul>
          </div>

          {/* Platform & Community */}
          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-3 text-xs uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onOpenSubmitModal}
                  className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1"
                >
                  <span>Submit a Tool</span>
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              </li>
              <li>
                <a
                  href="#methodology"
                  className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Curation Criteria
                </a>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1"
                >
                  <span>Open Data on GitHub</span>
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Editorial Integrity */}
          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-3 text-xs uppercase tracking-wider">
              Editorial Policy
            </h4>
            <p className="text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400 mb-2">
              Nexcoma does not accept payment, affiliate kickbacks, or gifts for ranking adjustments.
            </p>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
              Last updated: October 2026
            </p>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-neutral-100 pt-6 text-[11px] text-neutral-400 dark:border-neutral-800/60 dark:text-neutral-500">
          <div>
            © {new Date().getFullYear()} Nexcoma Inc. All rights reserved.
          </div>
          <div className="mt-2 sm:mt-0 flex items-center gap-4">
            <span className="hover:text-neutral-700 dark:hover:text-neutral-300 cursor-pointer">
              Privacy Policy
            </span>
            <span className="hover:text-neutral-700 dark:hover:text-neutral-300 cursor-pointer">
              Terms of Service
            </span>
            <span className="hover:text-neutral-700 dark:hover:text-neutral-300 cursor-pointer">
              Status
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
