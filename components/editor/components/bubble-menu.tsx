'use client';
/**
 * components/editor/components/bubble-menu.tsx
 *
 * Context-aware floating bubble menu — appears on text selection.
 * Shows the most relevant formatting actions for the selected content.
 */
import { BubbleMenu as TipBubble } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import {
  Bold, Italic, Underline, Strikethrough, Code,
  Link, AlignLeft, AlignCenter, AlignRight, Highlighter,
  Minus, Superscript, Subscript,
} from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { ColorPicker } from './color-picker';
import { TEXT_COLORS, HIGHLIGHT_COLORS } from '../config/types';

interface EditorBubbleMenuProps {
  editor: Editor;
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  const addLink = () => {
    const existing = editor.isActive('link')
      ? (editor.getAttributes('link').href as string) ?? '' : '';
    const url = window.prompt('Enter URL', existing);
    if (url === null) return;
    if (!url.trim()) { editor.chain().focus().unsetLink().run(); return; }
    const href = url.startsWith('http') ? url : `https://${url}`;
    editor.chain().focus().setLink({ href }).run();
  };

  const b = 'p-1.5 rounded hover:bg-white/20 transition-colors disabled:opacity-40';
  const a = 'p-1.5 rounded bg-white/25 transition-colors';
  const btn = (active: boolean) => active ? a : b;

  return (
    <TipBubble
      editor={editor}
      tippyOptions={{ duration: 100, placement: 'top' }}
      shouldShow={({ state }) => {
        const { from, to } = state.selection;
        return from !== to;
      }}
    >
      <div className="flex items-center gap-0.5 bg-gray-900 text-white rounded-xl px-2 py-1.5 shadow-2xl border border-white/10 text-sm">
        {/* Bold/Italic/Underline */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btn(editor.isActive('bold'))}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btn(editor.isActive('italic'))}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={btn(editor.isActive('underline'))}
          title="Underline (Ctrl+U)"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={btn(editor.isActive('strike'))}
          title="Strikethrough"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={btn(editor.isActive('code'))}
          title="Code"
        >
          <Code className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-4 bg-white/20 mx-1" />

        {/* Superscript / Subscript */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className={btn(editor.isActive('superscript'))}
          title="Superscript"
        >
          <Superscript className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          className={btn(editor.isActive('subscript'))}
          title="Subscript"
        >
          <Subscript className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-4 bg-white/20 mx-1" />

        {/* Text Color */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              type="button"
              className={b}
              title="Text color"
            >
              <span className="flex flex-col items-center gap-0.5">
                <span className="text-xs font-bold leading-none">A</span>
                <span
                  className="w-3.5 h-0.5 rounded-full"
                  style={{ backgroundColor: editor.getAttributes('textStyle').color || '#ffffff' }}
                />
              </span>
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              side="top"
              sideOffset={8}
              className="z-50 bg-white rounded-xl shadow-2xl border border-gray-200"
            >
              <ColorPicker
                label="Text Color"
                colors={TEXT_COLORS}
                value={editor.getAttributes('textStyle').color ?? ''}
                onChange={c => editor.chain().focus().setColor(c).run()}
                onClear={() => editor.chain().focus().unsetColor().run()}
              />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* Highlight */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <button type="button" className={btn(editor.isActive('highlight'))} title="Highlight">
              <Highlighter className="w-3.5 h-3.5" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              side="top"
              sideOffset={8}
              className="z-50 bg-white rounded-xl shadow-2xl border border-gray-200"
            >
              <ColorPicker
                label="Highlight"
                colors={HIGHLIGHT_COLORS}
                value={editor.getAttributes('highlight').color ?? ''}
                onChange={c => editor.chain().focus().setHighlight({ color: c }).run()}
                onClear={() => editor.chain().focus().unsetHighlight().run()}
              />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        <span className="w-px h-4 bg-white/20 mx-1" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={btn(editor.isActive({ textAlign: 'left' }))}
          title="Align left"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={btn(editor.isActive({ textAlign: 'center' }))}
          title="Center"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={btn(editor.isActive({ textAlign: 'right' }))}
          title="Align right"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-4 bg-white/20 mx-1" />

        {/* Link */}
        <button
          type="button"
          onClick={addLink}
          className={btn(editor.isActive('link'))}
          title="Insert link"
        >
          <Link className="w-3.5 h-3.5" />
        </button>

        {/* Divider line */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={b}
          title="Insert divider"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
      </div>
    </TipBubble>
  );
}
