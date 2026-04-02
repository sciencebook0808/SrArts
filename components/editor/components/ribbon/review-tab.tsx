'use client';
/**
 * components/editor/components/ribbon/review-tab.tsx
 * Review: Character Count · Word Count · AI Assistant toggle
 */
import type { Editor } from '@tiptap/core';
import { Sparkles, FileText, Hash } from 'lucide-react';

const G = 'flex items-center gap-2 px-3 border-r border-gray-200 last:border-0';

interface Props {
  editor: Editor;
  onToggleAI?: () => void;
  isAIOpen?: boolean;
}

export function ReviewTab({ editor, onToggleAI, isAIOpen }: Props) {
  const charCount = editor.storage.characterCount?.characters?.() ?? 0;
  const wordCount = editor.storage.characterCount?.words?.() ?? 0;

  return (
    <div className="flex items-center flex-wrap gap-y-1 py-1">
      {/* Stats */}
      <div className={G}>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Hash className="w-3.5 h-3.5" />
          <span><strong className="text-gray-800">{charCount.toLocaleString()}</strong> chars</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <FileText className="w-3.5 h-3.5" />
          <span><strong className="text-gray-800">{wordCount.toLocaleString()}</strong> words</span>
        </div>
      </div>

      {/* Reading time estimate */}
      <div className={G}>
        <span className="text-xs text-gray-500">
          ~<strong className="text-gray-800">{Math.max(1, Math.ceil(wordCount / 200))}</strong> min read
        </span>
      </div>

      {/* AI toggle */}
      {onToggleAI && (
        <div className={G}>
          <button
            type="button"
            onClick={onToggleAI}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isAIOpen
                ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-sm'
                : 'border border-violet-200 text-violet-700 hover:bg-violet-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Assistant
          </button>
        </div>
      )}
    </div>
  );
}
