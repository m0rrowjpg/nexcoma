import React, { useState } from 'react';
import {
  Scale,
  X,
  Plus,
  ExternalLink,
  Check,
  Minus,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { AITool } from '../types';
import { generateComparisonMatrix } from '../utils/filterEngine';

interface CompareViewProps {
  comparedTools: AITool[];
  onRemoveTool: (toolId: string) => void;
  onAddTool: (tool: AITool) => void;
  allTools: AITool[];
  onOpenDetail: (tool: AITool) => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  comparedTools,
  onRemoveTool,
  onAddTool,
  allTools,
  onOpenDetail,
}) => {
  const [showAddSelector, setShowAddSelector] = useState(false);

  // Preset comparison pairs
  const presets = [
    {
      label: 'Cursor vs GitHub Copilot',
      ids: ['cursor', 'github-copilot'],
    },
    {
      label: 'Claude 3.7 vs ChatGPT 4o',
      ids: ['claude', 'chatgpt'],
    },
    {
      label: 'n8n vs Make',
      ids: ['n8n', 'make'],
    },
    {
      label: 'Perplexity vs NotebookLM',
      ids: ['perplexity', 'notebooklm'],
    },
  ];

  const handleApplyPreset = (ids: string[]) => {
    // Clear and add preset tools
    const tools = allTools.filter((t) => ids.includes(t.id));
    // Remove existing
    comparedTools.forEach((t) => onRemoveTool(t.id));
    tools.forEach((t) => onAddTool(t));
  };

  const matrixRows = generateComparisonMatrix(comparedTools);
  const unselectedTools = allTools.filter(
    (t) => !comparedTools.some((c) => c.id === t.id)
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 pb-6 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
            <Scale className="h-4 w-4" />
            <span>Interactive Matrix</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
            Compare AI Tools Side-by-Side
          </h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Compare technical capabilities, pricing models, privacy policies, and workflow fit.
          </p>
        </div>

        {/* Preset quick buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-neutral-400 dark:text-neutral-500 font-medium">Presets:</span>
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handleApplyPreset(preset.ids)}
              className="rounded-lg border border-neutral-200/90 bg-white px-2.5 py-1 font-medium text-neutral-700 transition-colors hover:border-purple-300 hover:text-purple-600 dark:border-neutral-800 dark:bg-[#121216] dark:text-neutral-300 dark:hover:border-purple-700"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Area */}
      {comparedTools.length === 0 ? (
        <div className="my-16 flex flex-col items-center justify-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 mb-4">
            <Scale className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            No tools selected for comparison
          </h3>
          <p className="mt-1 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
            Select tools from the directory using the compare icon, or pick one of the presets above.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {presets.slice(0, 2).map((p) => (
              <button
                key={p.label}
                onClick={() => handleApplyPreset(p.ids)}
                className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-500"
              >
                Compare {p.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto pb-4">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <th className="w-1/4 pb-4 font-semibold text-neutral-500 dark:text-neutral-400 text-xs">
                  Feature / Specification
                </th>
                {comparedTools.map((tool) => (
                  <th key={tool.id} className="w-1/3 pb-4 pr-4">
                    <div className="relative rounded-xl border border-neutral-200/90 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-[#141418]">
                      <button
                        onClick={() => onRemoveTool(tool.id)}
                        className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:text-neutral-500"
                        title="Remove tool from comparison"
                        aria-label={`Remove ${tool.name}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>

                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold text-white"
                          style={{ backgroundColor: tool.iconBg }}
                        >
                          {tool.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 pr-4">
                          <h4 className="font-semibold text-neutral-900 dark:text-white truncate">
                            {tool.name}
                          </h4>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            {tool.category}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => onOpenDetail(tool)}
                          className="text-xs text-purple-600 hover:underline dark:text-purple-400 font-medium"
                        >
                          View Details
                        </button>
                        <span className="text-neutral-300 dark:text-neutral-700">·</span>
                        <a
                          href={tool.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                        >
                          <span>Official</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </th>
                ))}
                {comparedTools.length < 3 && (
                  <th className="w-1/4 pb-4">
                    <div className="relative flex min-h-[108px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 p-4 text-center dark:border-neutral-800">
                      <button
                        onClick={() => setShowAddSelector(!showAddSelector)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:underline dark:text-purple-400"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Tool</span>
                      </button>

                      {showAddSelector && (
                        <div className="absolute top-full left-0 z-20 mt-2 max-h-60 w-56 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-800 dark:bg-[#141418]">
                          {unselectedTools.slice(0, 8).map((tool) => (
                            <button
                              key={tool.id}
                              onClick={() => {
                                onAddTool(tool);
                                setShowAddSelector(false);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                            >
                              <span className="truncate">{tool.name}</span>
                              <span className="text-[10px] text-neutral-400 ml-auto">
                                {tool.category}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60 text-xs">
              {matrixRows.map((row) => (
                <tr key={row.id} className="hover:bg-neutral-50/50 dark:hover:bg-[#141418]/50">
                  <td className="py-3.5 pr-4 font-medium text-neutral-600 dark:text-neutral-400">
                    {row.label}
                  </td>
                  {row.values.map((val, idx) => (
                    <td key={idx} className="py-3.5 pr-4 text-neutral-900 dark:text-neutral-100">
                      {val === 'Yes' ? (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <Check className="h-3.5 w-3.5" />
                          <span>Yes</span>
                        </span>
                      ) : val === 'No' ? (
                        <span className="flex items-center gap-1 text-neutral-400">
                          <Minus className="h-3.5 w-3.5" />
                          <span>No</span>
                        </span>
                      ) : (
                        <span>{String(val)}</span>
                      )}
                    </td>
                  ))}
                  {comparedTools.length < 3 && <td />}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
