import React, { useState } from 'react';
import { X, Send, CheckCircle2, AlertCircle, LoaderCircle } from 'lucide-react';
import type { CategoryMeta, ToolCategory, PricingModel } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface SubmitToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryMeta[];
}

export const SubmitToolModal: React.FC<SubmitToolModalProps> = ({ isOpen, onClose, categories }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<ToolCategory>(categories[0]?.id ?? 'Coding');
  const [pricing, setPricing] = useState<PricingModel>('Freemium');
  const [tagline, setTagline] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (categories.length && !categories.some((item) => item.id === category)) {
      setCategory(categories[0].id);
    }
  }, [categories, category]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide the tool name.');
      return;
    }
    let validUrl: URL;
    try {
      validUrl = new URL(url.trim());
      if (validUrl.protocol !== 'https:') throw new Error();
    } catch {
      setError('Please provide a valid website URL starting with https://');
      return;
    }
    if (!tagline.trim()) {
      setError('Please provide a short description or tagline.');
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setError('Tool submissions are temporarily unavailable. Please try again later.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const { error: submitError } = await supabase.from('tool_submissions').insert({
        name: name.trim(),
        url: validUrl.toString(),
        category,
        pricing_model: pricing,
        tagline: tagline.trim(),
        submitter_email: email.trim() || null,
      });
      if (submitError) {
        setError(`Could not submit your suggestion: ${submitError.message}`);
        return;
      }
      setSubmitted(true);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? `Could not submit your suggestion: ${submissionError.message}` : 'Could not submit your suggestion. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setUrl('');
    setTagline('');
    setEmail('');
    setSubmitted(false);
    setError(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-[#121216] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Submit a Tool or Utility
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Suggest an AI tool or software service for editorial review.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="text-base font-semibold text-neutral-900 dark:text-white">
              Submission Received
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
              Thank you for suggesting <strong>{name}</strong>. Our editorial team inspects every tool for functionality, privacy practices, and pricing transparency before listing.
            </p>
            <div className="pt-4">
              <button
                onClick={handleReset}
                className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-semibold text-white hover:bg-purple-500 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Tool Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cursor, Ollama, Resend"
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900 focus:border-purple-600 focus:outline-none dark:border-neutral-800 dark:bg-[#15151A] dark:text-white"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Official Website URL *
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900 focus:border-purple-600 focus:outline-none dark:border-neutral-800 dark:bg-[#15151A] dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Primary Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ToolCategory)}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-2 text-neutral-900 focus:border-purple-600 focus:outline-none dark:border-neutral-800 dark:bg-[#15151A] dark:text-white"
                >
                  {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Pricing Model
                </label>
                <select
                  value={pricing}
                  onChange={(e) => setPricing(e.target.value as PricingModel)}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-2 text-neutral-900 focus:border-purple-600 focus:outline-none dark:border-neutral-800 dark:bg-[#15151A] dark:text-white"
                >
                  <option value="Free">Free</option>
                  <option value="Freemium">Freemium</option>
                  <option value="Paid">Paid</option>
                  <option value="Open Source">Open Source</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Core Purpose / Tagline *
              </label>
              <textarea
                rows={2}
                required
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Briefly describe what makes this tool uniquely capable..."
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900 focus:border-purple-600 focus:outline-none dark:border-neutral-800 dark:bg-[#15151A] dark:text-white resize-none"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Your Email (Optional, for verification)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@company.com"
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900 focus:border-purple-600 focus:outline-none dark:border-neutral-800 dark:bg-[#15151A] dark:text-white"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-neutral-200 px-3.5 py-2 font-medium text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white shadow-xs transition-colors hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                <span>{submitting ? 'Submitting…' : 'Submit Tool'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
