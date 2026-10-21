import React from 'react';
import { BookOpen, ArrowRight, Clock } from 'lucide-react';
import type { GuideArticle } from '../types';

interface GuidesSectionProps {
  guides: GuideArticle[];
  onOpenGuide: (guide: GuideArticle) => void;
}

export const GuidesSection: React.FC<GuidesSectionProps> = ({ guides, onOpenGuide }) => {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-neutral-200/70 dark:border-neutral-800/70">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
            <BookOpen className="h-4 w-4" />
            <span>Engineering Analysis & Guides</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
            Practical Workflows & Architecture
          </h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            In-depth benchmarks, structured automation blueprints, and independent evaluations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {guides.map((guide) => (
          <article
            key={guide.id}
            onClick={() => onOpenGuide(guide)}
            className="group flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white overflow-hidden shadow-2xs transition-all hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-[#111115] cursor-pointer"
          >
            <div>
              {/* Cover Image with fallback container */}
              <div className="relative aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                {guide.coverImage ? (
                  <img
                    src={guide.coverImage}
                    alt={guide.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
                    onError={(e) => {
                      // Fallback gracefully
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Metadata Line */}
                <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                  <span className="font-medium text-purple-600 dark:text-purple-400">
                    {guide.category}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{guide.readTime}</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{guide.date}</span>
                </div>

                <h3 className="text-base font-semibold text-neutral-900 group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                  {guide.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400 line-clamp-3">
                  {guide.excerpt}
                </p>
              </div>
            </div>

            {/* Footer with Author and Read link */}
            <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800/60 text-xs">
              <span className="text-neutral-500 dark:text-neutral-400 truncate max-w-[160px]">
                {guide.author.name}
              </span>
              <span className="flex items-center gap-1 font-semibold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
                <span>Read Guide</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
