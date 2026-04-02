'use client';
/**
 * components/editor/components/ai-panel.tsx
 *
 * Gemini AI assistant panel — slides in from the right.
 * Supports all AI commands: improve, rewrite, summarize, social captions etc.
 */
import { useState, useCallback } from 'react';
import type { Editor } from '@tiptap/core';
import {
  Sparkles, X, Loader2, Copy, Check, ChevronDown, RefreshCw,
} from 'lucide-react';
import { useGemini } from '../hooks/use-gemini';
import { AI_COMMANDS } from '../config/types';
import type { AICommand } from '../config/types';

interface AIPanelProps {
  editor: Editor;
  onClose: () => void;
}

export function AIPanel({ editor, onClose }: AIPanelProps) {
  const { isLoading, error, result, generate, reset } = useGemini();
  const [activeCommand, setActiveCommand] = useState<AICommand>('improve');
  const [customPrompt, setCustomPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>('Edit');

  const hasSelection = !editor.state.selection.empty;
  const selectedText = hasSelection
    ? editor.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to
      )
    : '';

  const fullContent = editor.getText();

  const handleRun = useCallback(async () => {
    const text = selectedText || fullContent;
    if (!text.trim()) return;

    await generate({
      command: activeCommand,
      selectedText: text,
      fullContent,
    });
  }, [activeCommand, selectedText, fullContent, generate]);

  const handleApply = useCallback(() => {
    if (!result) return;

    editor.chain().focus().run();

    if (hasSelection) {
      // Replace selected text
      editor.chain()
        .focus()
        .deleteSelection()
        .insertContent(result)
        .run();
    } else {
      // Append below cursor
      editor.chain()
        .focus()
        .insertContent(`\n\n${result}`)
        .run();
    }
    reset();
  }, [result, editor, hasSelection, reset]);

  const handleCopy = useCallback(async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  const groups = Array.from(new Set(AI_COMMANDS.map(c => c.group)));

  return (
    <div className="flex flex-col h-full border-l border-gray-200 bg-gradient-to-b from-white to-gray-50 w-72 shrink-0">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-white">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">AI Assistant</h3>
          <p className="text-[10px] text-gray-400">Powered by Gemini</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Context indicator */}
      <div className={`mx-3 mt-3 px-3 py-2 rounded-lg text-xs ${
        hasSelection
          ? 'bg-blue-50 border border-blue-200 text-blue-700'
          : 'bg-gray-100 border border-gray-200 text-gray-500'
      }`}>
        {hasSelection
          ? `✓ ${selectedText.slice(0, 60)}${selectedText.length > 60 ? '…' : ''}`
          : 'Select text first, or use full document context'
        }
      </div>

      {/* Commands */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {groups.map(group => (
          <div key={group}>
            <button
              type="button"
              onClick={() => setOpenGroup(openGroup === group ? null : group)}
              className="w-full flex items-center justify-between py-1.5 px-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors"
            >
              {group}
              <ChevronDown
                className={`w-3 h-3 transition-transform ${openGroup === group ? 'rotate-180' : ''}`}
              />
            </button>

            {openGroup === group && (
              <div className="space-y-0.5">
                {AI_COMMANDS.filter(c => c.group === group).map(cmd => (
                  <button
                    key={cmd.value}
                    type="button"
                    onClick={() => setActiveCommand(cmd.value)}
                    className={`
                      w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors text-sm
                      ${activeCommand === cmd.value
                        ? 'bg-violet-50 text-violet-700 border border-violet-200'
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    <span className="text-base w-5 text-center shrink-0">{cmd.icon}</span>
                    <span className="font-medium">{cmd.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Custom prompt */}
        <div className="pt-2 border-t border-gray-200">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 px-1">
            Custom Prompt
          </p>
          <textarea
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            placeholder="Type your custom instruction…"
            rows={2}
            className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none bg-white"
          />
        </div>
      </div>

      {/* Run button */}
      <div className="p-3 border-t border-gray-200 space-y-2">
        <button
          type="button"
          onClick={() => void handleRun()}
          disabled={isLoading || (!hasSelection && !fullContent.trim())}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-violet-700 hover:to-blue-700 disabled:opacity-50 transition-all shadow-sm"
        >
          {isLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Thinking…</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Run AI</>
          )}
        </button>

        {error && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {result && !error && (
          <div className="space-y-2">
            <div className="p-3 bg-white border border-gray-200 rounded-xl max-h-36 overflow-y-auto">
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{result}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleApply}
                className="flex-1 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                Apply to Editor
              </button>
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="px-3 py-2 border border-gray-200 text-gray-600 text-xs rounded-lg hover:bg-gray-50 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => void handleRun()}
                disabled={isLoading}
                className="px-3 py-2 border border-gray-200 text-gray-600 text-xs rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
