import React, { createContext, useContext, useEffect, useState } from 'react';
import { TOOLS_DATA } from '../data/toolsData';
import type { AITool } from '../types';

interface SavedToolsContextType {
  savedIds: string[];
  savedTools: AITool[];
  toggleSave: (toolId: string) => void;
  isSaved: (toolId: string) => boolean;
  clearSaved: () => void;
}

const SavedToolsContext = createContext<SavedToolsContextType | undefined>(undefined);

export const SavedToolsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('nexcoma_saved_tools');
      return stored ? JSON.parse(stored) : ['cursor', 'n8n'];
    } catch {
      return ['cursor', 'n8n'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('nexcoma_saved_tools', JSON.stringify(savedIds));
    } catch (e) {
      console.error('Failed to persist saved tools', e);
    }
  }, [savedIds]);

  const toggleSave = (toolId: string) => {
    setSavedIds((prev) =>
      prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]
    );
  };

  const isSaved = (toolId: string) => savedIds.includes(toolId);

  const clearSaved = () => setSavedIds([]);

  const savedTools = TOOLS_DATA.filter((tool) => savedIds.includes(tool.id));

  return (
    <SavedToolsContext.Provider
      value={{ savedIds, savedTools, toggleSave, isSaved, clearSaved }}
    >
      {children}
    </SavedToolsContext.Provider>
  );
};

export function useSavedTools() {
  const context = useContext(SavedToolsContext);
  if (!context) {
    throw new Error('useSavedTools must be used within a SavedToolsProvider');
  }
  return context;
}
