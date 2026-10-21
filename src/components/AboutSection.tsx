import React from 'react';
import { ShieldCheck, Eye, Sparkles, Scale, CheckCircle2 } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2">
          <ShieldCheck className="h-4 w-4" />
          <span>Editorial Standard</span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
          Independent curation. Zero paid placements.
        </h2>
        <p className="mt-3 text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
          The software ecosystem has been flooded with low-utility wrappers, manufactured reviews,
          and affiliate farms. Nexcoma was created to restore clarity through rigorous, hands-on technical evaluation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-[#111115]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 mb-4">
            <Eye className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">
            1. Real Hands-On Testing
          </h3>
          <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
            Every product listed has been tested in practical engineering and creative workflows. We don’t rewrite promotional press releases; we measure real token usage, latency, and edge cases.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-[#111115]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 mb-4">
            <Scale className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">
            2. Transparent Pricing Audits
          </h3>
          <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
            We document what you actually get on free tiers versus what requires a recurring credit card. No bait-and-switch billing surprises or hidden consumption meters.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-[#111115]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 mb-4">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">
            3. Privacy & IP Integrity
          </h3>
          <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
            We review terms of service to verify whether your inputs and source code are used for foundation model training, highlighting zero-retention and self-hostable solutions.
          </p>
        </div>
      </div>

      {/* Principles checklist */}
      <div className="mt-12 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-6 sm:p-8 dark:border-neutral-800 dark:bg-[#141418]/60">
        <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-4">
          Our Operational Guarantees
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-700 dark:text-neutral-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>No paid rank manipulation or sponsored search results</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Direct outbound links without deceptive redirect cloaking</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Verified open-source and self-hosted options explicitly flagged</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Continuous re-testing as models and tool capabilities update</span>
          </div>
        </div>
      </div>
    </section>
  );
};
