import React from 'react';
import { X, Clock, Calendar, User, ArrowLeft, Share2, Check } from 'lucide-react';
import { GuideArticle } from '../types';

interface GuideReaderModalProps {
  guide: GuideArticle | null;
  onClose: () => void;
}

export const GuideReaderModal: React.FC<GuideReaderModalProps> = ({ guide, onClose }) => {
  if (!guide) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <article
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-[#121216] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Guides</span>
          </button>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-800 dark:text-neutral-400"
            aria-label="Close article"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Reader Content */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-8 space-y-8">
          {/* Article Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-medium text-purple-600 dark:text-purple-400">
              <span>{guide.category}</span>
              <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
              <span className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                <Clock className="h-3 w-3" />
                <span>{guide.readTime}</span>
              </span>
              <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
              <span className="text-neutral-500 dark:text-neutral-400">{guide.date}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              {guide.title}
            </h1>

            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
              {guide.subtitle}
            </p>

            {/* Author info */}
            <div className="flex items-center gap-3 border-y border-neutral-100 py-3 dark:border-neutral-800/80">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-semibold text-xs">
                {guide.author.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div className="text-xs">
                <div className="font-semibold text-neutral-900 dark:text-white">
                  {guide.author.name}
                </div>
                <div className="text-neutral-500 dark:text-neutral-400">
                  {guide.author.role}
                </div>
              </div>
            </div>
          </div>

          {/* Key Takeaways Box */}
          <div className="rounded-xl border border-purple-200/60 bg-purple-50/40 p-5 dark:border-purple-900/40 dark:bg-purple-950/20">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-900 dark:text-purple-300 mb-3">
              Executive Takeaways
            </h3>
            <ul className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
              {guide.keyTakeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="font-semibold text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                  <span className="leading-relaxed">{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Article Sections */}
          <div className="space-y-8 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            {guide.contentSections.map((sec, idx) => (
              <section key={idx} className="space-y-3">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {sec.heading}
                </h2>
                {sec.body.map((p, pIdx) => (
                  <p key={pIdx} className="leading-relaxed">
                    {p}
                  </p>
                ))}
                {sec.highlightQuote && (
                  <blockquote className="my-4 rounded-xl border border-neutral-200 bg-neutral-50/80 p-4 font-medium italic text-neutral-800 dark:border-neutral-800 dark:bg-[#16161C] dark:text-neutral-200">
                    &ldquo;{sec.highlightQuote}&rdquo;
                  </blockquote>
                )}
              </section>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
};
