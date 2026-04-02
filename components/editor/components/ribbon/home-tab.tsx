'use client';
/**
 * components/editor/components/ribbon/home-tab.tsx
 * Home tab: Clipboard · Font · Paragraph · Styles
 */
import type { Editor } from '@tiptap/core';
import {
  Bold, Italic, Underline, Strikethrough, Code,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, CheckSquare, Undo, Redo,
  Superscript, Subscript, RemoveFormatting, Highlighter, Type,
} from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { ColorPicker } from '../color-picker';
import {
  TEXT_COLORS, HIGHLIGHT_COLORS, FONT_FAMILIES, FONT_SIZES
} from '../../config/types';

const G = 'flex items-center gap-0.5 px-2 border-r border-gray-200 last:border-0';
const B = 'p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-40 flex items-center justify-center';
const BA = 'p-1.5 rounded bg-blue-50 text-blue-600 transition-colors flex items-center justify-center';
const btn = (active: boolean) => active ? BA : B;

interface Props { editor: Editor }

export function HomeTab({ editor }: Props) {
  const fontFamily = editor.getAttributes('textStyle').fontFamily ?? '';
  const fontSize = editor.getAttributes('textStyle').fontSize ?? '16px';

  return (
    <div className="flex items-center flex-wrap gap-y-1 py-1">

      {/* Clipboard */}
      <div className={G}>
        <button type="button" onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()} className={B} title="Undo (Ctrl+Z)">
          <Undo className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()} className={B} title="Redo (Ctrl+Y)">
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Font Family */}
      <div className={G}>
        <select
          value={fontFamily}
          onChange={e => {
            if (e.target.value) {
              editor.chain().focus().setFontFamily(e.target.value).run();
            } else {
              editor.chain().focus().unsetFontFamily().run();
            }
          }}
          className="h-7 text-xs border border-gray-200 rounded-md px-1 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white w-28"
        >
          {FONT_FAMILIES.map(f => (
            <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
              {f.label}
            </option>
          ))}
        </select>

        <select
          value={fontSize}
          onChange={e => editor.chain().focus().setFontSize(e.target.value).run()}
          className="h-7 text-xs border border-gray-200 rounded-md px-1 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white w-16"
        >
          {FONT_SIZES.map(s => (
            <option key={s} value={s}>{s.replace('px', '')}</option>
          ))}
        </select>
      </div>

      {/* Text Formatting */}
      <div className={G}>
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}
          className={btn(editor.isActive('bold'))} title="Bold (Ctrl+B)">
          <Bold className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btn(editor.isActive('italic'))} title="Italic (Ctrl+I)">
          <Italic className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={btn(editor.isActive('underline'))} title="Underline (Ctrl+U)">
          <Underline className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()}
          className={btn(editor.isActive('strike'))} title="Strikethrough">
          <Strikethrough className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleCode().run()}
          className={btn(editor.isActive('code'))} title="Inline code">
          <Code className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className={btn(editor.isActive('superscript'))} title="Superscript">
          <Superscript className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleSubscript().run()}
          className={btn(editor.isActive('subscript'))} title="Subscript">
          <Subscript className="w-4 h-4" />
        </button>
        <button type="button"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          className={B} title="Clear formatting">
          <RemoveFormatting className="w-4 h-4" />
        </button>
      </div>

      {/* Colors */}
      <div className={G}>
        <Popover.Root>
          <Popover.Trigger asChild>
            <button type="button" className={B} title="Text color">
              <span className="flex flex-col items-center gap-0.5">
                <Type className="w-4 h-4" />
                <span className="w-4 h-0.5 rounded-full" style={{
                  backgroundColor: editor.getAttributes('textStyle').color || '#000'
                }} />
              </span>
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content side="bottom" sideOffset={4} className="z-50 bg-white rounded-xl shadow-2xl border border-gray-200">
              <ColorPicker label="Text Color" colors={TEXT_COLORS}
                value={editor.getAttributes('textStyle').color ?? ''}
                onChange={c => editor.chain().focus().setColor(c).run()}
                onClear={() => editor.chain().focus().unsetColor().run()} />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        <Popover.Root>
          <Popover.Trigger asChild>
            <button type="button" className={btn(editor.isActive('highlight'))} title="Highlight color">
              <Highlighter className="w-4 h-4" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content side="bottom" sideOffset={4} className="z-50 bg-white rounded-xl shadow-2xl border border-gray-200">
              <ColorPicker label="Highlight" colors={HIGHLIGHT_COLORS}
                value={editor.getAttributes('highlight').color ?? ''}
                onChange={c => editor.chain().focus().setHighlight({ color: c }).run()}
                onClear={() => editor.chain().focus().unsetHighlight().run()} />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>

      {/* Alignment */}
      <div className={G}>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={btn(editor.isActive({ textAlign: 'left' }))} title="Align left">
          <AlignLeft className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={btn(editor.isActive({ textAlign: 'center' }))} title="Center">
          <AlignCenter className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={btn(editor.isActive({ textAlign: 'right' }))} title="Align right">
          <AlignRight className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={btn(editor.isActive({ textAlign: 'justify' }))} title="Justify">
          <AlignJustify className="w-4 h-4" />
        </button>
      </div>

      {/* Lists */}
      <div className={G}>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={btn(editor.isActive('bulletList'))} title="Bullet list">
          <List className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={btn(editor.isActive('orderedList'))} title="Numbered list">
          <ListOrdered className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={btn(editor.isActive('taskList'))} title="Task list">
          <CheckSquare className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
