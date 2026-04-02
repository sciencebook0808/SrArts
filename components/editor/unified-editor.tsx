'use client';
/**
 * components/editor/unified-editor.tsx
 *
 * The single source of truth for all editor usage in SR Arts.
 * - Word-style ribbon UI (Home / Insert / Layout / Review / View)
 * - Floating bubble menu on selection
 * - Slash command menu (type "/" at line start)
 * - AI assistant panel (Gemini-powered)
 * - Drop-and-upload images
 * - JSON-safe content model (serializes to HTML for DB storage)
 * - Perfect paragraph / line-break behavior
 */
import {
  useEditor, EditorContent, ReactRenderer,
} from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import type { SuggestionKeyDownProps } from '@tiptap/suggestion';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import tippy, { type Instance as TippyInstance } from 'tippy.js';
import 'tippy.js/dist/tippy.css';

import { EditorRibbon } from './components/ribbon';
import { EditorBubbleMenu } from './components/bubble-menu';
import { SlashMenu, type SlashMenuHandle } from './components/slash-menu';
import { AIPanel } from './components/ai-panel';
import { getExtensions } from './config/extensions';
import { SlashCommand, filterSlashCommands } from './extensions/slash-command';
import { uploadToCloudinary } from '@/lib/cloudinary-upload';
import { toast } from 'sonner';
import type { EditorMode } from './config/types';

// ─── Props ────────────────────────────────────────────────────────────────────
export interface UnifiedEditorProps {
  /** Serialised HTML string — what you store in the DB */
  content: string;
  /** Called with new HTML on every change (debounced 300ms) */
  onChange: (html: string) => void;
  /** Editor context — controls which extension bundles are loaded */
  mode?: EditorMode;
  placeholder?: string;
  minHeight?: string;
  uploadFolder?: string;
  /** Whether to show the ribbon toolbar */
  showRibbon?: boolean;
  /** Whether to show the floating bubble menu on selection */
  showBubbleMenu?: boolean;
  /** Whether to show the character/word count bar */
  showCharCount?: boolean;
  /** Whether the AI panel button is available in the Review tab */
  enableAI?: boolean;
}

// ─── Editor styles ────────────────────────────────────────────────────────────
const PROSE_CLASSES = [
  // Base layout
  'prose prose-base max-w-none focus:outline-none',
  // Paragraph spacing — no extra gap from Tailwind prose defaults
  'prose-p:my-[0.6em] prose-p:leading-[1.7]',
  // Headings
  'prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:text-gray-900',
  'prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg',
  // Links
  'prose-a:text-blue-600 prose-a:underline prose-a:underline-offset-2',
  // Blockquote
  'prose-blockquote:border-l-4 prose-blockquote:border-blue-400 prose-blockquote:pl-4',
  'prose-blockquote:italic prose-blockquote:text-gray-600',
  // Code
  'prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-rose-600',
  'prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:shadow-lg',
  // Images
  'prose-img:rounded-xl prose-img:shadow-md prose-img:my-4',
  // Tables
  'prose-table:border-collapse prose-td:border prose-td:border-gray-200 prose-td:px-3 prose-td:py-2',
  'prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:px-3 prose-th:py-2 prose-th:font-semibold',
  // HR
  'prose-hr:border-gray-200 prose-hr:my-6',
  // Task lists
  '[&_.task-list]:list-none [&_.task-list]:pl-0',
  '[&_.task-item]:flex [&_.task-item]:items-start [&_.task-item]:gap-2',
  '[&_.task-item_>_label]:flex [&_.task-item_>_label]:items-center [&_.task-item_>_label]:gap-2',
  '[&_.task-item_input]:w-4 [&_.task-item_input]:h-4 [&_.task-item_input]:accent-blue-500',
  // Placeholder
  '[&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
  '[&_.is-editor-empty:first-child::before]:text-gray-400',
  '[&_.is-editor-empty:first-child::before]:float-left',
  '[&_.is-editor-empty:first-child::before]:pointer-events-none',
  '[&_.is-editor-empty:first-child::before]:h-0',
  // YouTube iframes
  '[&_iframe]:w-full [&_iframe]:rounded-xl [&_iframe]:aspect-video [&_iframe]:border-0 [&_iframe]:my-4 [&_iframe]:shadow-md',
  // Gapcursor
  '[&_.ProseMirror-gapcursor]:after:border-t-2 [&_.ProseMirror-gapcursor]:after:border-gray-400',
].join(' ');

// ─── Main Component ───────────────────────────────────────────────────────────
export function UnifiedEditor({
  content,
  onChange,
  mode = 'blog',
  placeholder = 'Start writing… (type "/" for commands)',
  minHeight = '320px',
  uploadFolder = 'sr_arts',
  showRibbon = true,
  showBubbleMenu = true,
  showCharCount = true,
  enableAI = true,
}: UnifiedEditorProps) {
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const changeTimer = useRef<ReturnType<typeof setTimeout>>();

  // Slash menu wiring
  const slashMenuRef = useRef<SlashMenuHandle | null>(null);
  const slashTippyRef = useRef<TippyInstance | null>(null);
  const slashRendererRef = useRef<ReactRenderer<SlashMenuHandle> | null>(null);

  const enableSocial = mode === 'blog';
  const enableTables = mode === 'blog' || mode === 'community';

  // ── Extension list with slash command wired to React ──────────────────────
  const extensions = useMemo(() => {
    const base = getExtensions(mode, {
      placeholder,
      uploadFolder,
      enableSocial,
      enableTables,
    });

    return [
      ...base,
      SlashCommand.configure({
        suggestion: {
          items: ({ query }: { query: string }) => filterSlashCommands(query),
          render: () => ({
            onStart: (props) => {
              slashRendererRef.current = new ReactRenderer(SlashMenu, {
                props,
                editor: props.editor,
              });

              if (!props.clientRect) return;

              slashTippyRef.current = tippy(document.body, {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: slashRendererRef.current.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
                theme: 'slash-menu',
                arrow: false,
                offset: [0, 4],
              });
              slashMenuRef.current = slashRendererRef.current.ref;
            },
            onUpdate: (props) => {
              slashRendererRef.current?.updateProps(props);
              if (props.clientRect && slashTippyRef.current) {
                slashTippyRef.current.setProps({
                  getReferenceClientRect: props.clientRect as () => DOMRect,
                });
              }
              slashMenuRef.current = slashRendererRef.current?.ref ?? null;
            },
            onKeyDown: ({ event }: SuggestionKeyDownProps) => {
              if (event.key === 'Escape') {
                slashTippyRef.current?.hide();
                return true;
              }
              return slashMenuRef.current?.onKeyDown(event) ?? false;
            },
            onExit: () => {
              slashTippyRef.current?.destroy();
              slashTippyRef.current = null;
              slashRendererRef.current?.destroy();
              slashRendererRef.current = null;
            },
          }),
        },
      }),
    ];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, placeholder, uploadFolder]);

  // ── Editor init ────────────────────────────────────────────────────────────
  const editor = useEditor({
    extensions,
    content,
    editorProps: {
      attributes: {
        class: PROSE_CLASSES,
        style: `min-height: ${minHeight}`,
        spellcheck: 'true',
      },
      // ── Drop image to upload ──
      handleDrop(view, event, _slice, moved) {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0];
          if (file?.type.startsWith('image/')) {
            event.preventDefault();
            const id = toast.loading('Uploading image…');
            void uploadToCloudinary(file, uploadFolder)
              .then(result => {
                const pos = view.posAtCoords({
                  left: event.clientX,
                  top: event.clientY,
                });
                view.dispatch(
                  view.state.tr.insert(
                    pos?.pos ?? view.state.doc.content.size,
                    view.state.schema.nodes.customImage?.create({ src: result.secure_url }) ??
                    view.state.schema.nodes.image?.create({ src: result.secure_url })
                  )
                );
                toast.success('Image inserted!', { id });
              })
              .catch(() => toast.error('Upload failed', { id }));
            return true;
          }
        }
        return false;
      },
      // ── Paste image ──
      handlePaste(view, event) {
        const items = Array.from(event.clipboardData?.items ?? []);
        const imageItem = items.find(i => i.type.startsWith('image/'));
        if (imageItem) {
          event.preventDefault();
          const file = imageItem.getAsFile();
          if (file) {
            const id = toast.loading('Uploading pasted image…');
            void uploadToCloudinary(file, uploadFolder)
              .then(result => {
                view.dispatch(
                  view.state.tr.replaceSelectionWith(
                    view.state.schema.nodes.customImage?.create({ src: result.secure_url }) ??
                    view.state.schema.nodes.image?.create({ src: result.secure_url })
                  )
                );
                toast.success('Image inserted!', { id });
              })
              .catch(() => toast.error('Upload failed', { id }));
          }
          return true;
        }
        return false;
      },
    },
    onUpdate({ editor: e }) {
      clearTimeout(changeTimer.current);
      changeTimer.current = setTimeout(() => {
        onChange(e.getHTML());
      }, 300);
    },
    onFocus() { setIsFocused(false); },
  });

  // ── Sync content prop → editor when changed externally ────────────────────
  useEffect(() => {
    if (!editor) return;
    if (content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  // ── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearTimeout(changeTimer.current);
    };
  }, []);

  if (!editor) return null;

  const charCount = editor.storage.characterCount?.characters?.() ?? 0;
  const wordCount = editor.storage.characterCount?.words?.() ?? 0;

  return (
    <div className={`
      border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm
      ${isFocused ? 'ring-2 ring-blue-400/60' : ''}
    `}>
      {/* Ribbon */}
      {showRibbon && (
        <EditorRibbon
          editor={editor}
          uploadFolder={uploadFolder}
          enableSocial={enableSocial}
          enableTables={enableTables}
          onToggleAI={enableAI ? () => setIsAIOpen(v => !v) : undefined}
          isAIOpen={isAIOpen}
          onToggleFocus={() => setIsFocused(v => !v)}
          isFocused={isFocused}
        />
      )}

      {/* Editor body + AI panel */}
      <div className="flex">
        {/* Editor area */}
        <div className="flex-1 min-w-0">
          {showBubbleMenu && <EditorBubbleMenu editor={editor} />}

          <EditorContent
            editor={editor}
            className="px-8 py-6 [&_.ProseMirror]:focus:outline-none"
          />
        </div>

        {/* AI panel (slides in on Review > AI toggle) */}
        {isAIOpen && enableAI && (
          <AIPanel
            editor={editor}
            onClose={() => setIsAIOpen(false)}
          />
        )}
      </div>

      {/* Status bar */}
      {showCharCount && (
        <div className="flex items-center justify-between px-4 py-1.5 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
          <span>
            <span className="font-medium text-gray-600">{wordCount.toLocaleString()}</span> words ·{' '}
            <span className="font-medium text-gray-600">{charCount.toLocaleString()}</span> characters
          </span>
          <span>
            ~{Math.max(1, Math.ceil(wordCount / 200))} min read · Type <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded text-[10px]">/</kbd> for commands
          </span>
        </div>
      )}
    </div>
  );
}
