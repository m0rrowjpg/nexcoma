import React from 'react';
import { X, Bookmark, ExternalLink, Trash2, ArrowUpRight } from 'lucide-react';
import { useSavedTools } from '../context/SavedToolsContext';
import { AITool } from '../types';

interface SavedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: AITool) => void;
}

export const SavedDrawer: React.FC<SavedDrawerProps> = ({
  isOpen,
  onClose,
  onSelectTool,
}) => {
  const { savedTools, toggleSave, clearSaved } = useSavedTools();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative flex h-full w-full max-w-md flex-col border-l border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-[#121216] animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
              My Saved Workbench ({savedTools.length})
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {savedTools.length > 0 && (
              <button
                onClick={clearSaved}
                className="text-[11px] font-medium text-neutral-500 hover:text-red-500 transition-colors"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
              aria-label="Close saved drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {savedTools.length === 0 ? (
            <div className="my-20 flex flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 mb-3">
                <Bookmark className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                No saved tools yet
              </h3>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 max-w-xs">
                Click the bookmark icon on any tool card to curate your personal AI stack.
              </p>
            </div>
          ) : (
            savedTools.map((tool) => (
              <div
                key={tool.id}
                className="group flex items-center justify-between gap-3 rounded-xl border border-neutral-200/90 p-3.5 transition-all hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700 bg-white dark:bg-[#15151B]"
              >
                <div
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  onClick={() => {
                    onSelectTool(tool);
                    onClose();
                  }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold text-white"
                    style={{ backgroundColor: tool.iconBg }}
                  >
                    {tool.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-neutral-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400">
                      {tool.name}
                    </h4>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                      {tool.category} · {tool.startingPrice}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={tool.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:border-neutral-800 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-white"
                    title="Visit website"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <button
                    onClick={() => toggleSave(tool.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 hover:bg-red-50 hover:text-red-500 dark:border-neutral-800 dark:text-neutral-500 dark:hover:bg-red-950/30"
                    title="Remove from saved"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {savedTools.length > 0 && (
          <div className="border-t border-neutral-200 p-4 dark:border-neutral-800 text-center">
            <button
              onClick={() => {
                const markdown = savedTools
                  .map((t) => `- **${t.name}** (${t.category}) - ${t.startingPrice} - ${t.officialUrl}`)
                  .join('\n');
                navigator.clipboard.writeText(
                  `# My Nexcoma Stack\n\n${markdown}\n\nExported from Nexcoma`
                );
                alert('Copied your saved stack to clipboard as Markdown!');
              }}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
            >
              Export Stack as Markdown
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
