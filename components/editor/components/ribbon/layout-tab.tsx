'use client';
/**
 * components/editor/components/ribbon/layout-tab.tsx
 * Layout: Alignment · Spacing · Indent
 */
import type { Editor } from '@tiptap/core';
import {
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  IndentIncrease, IndentDecrease,
} from 'lucide-react';
import { LINE_HEIGHTS } from '../../config/types';

const G = 'flex items-center gap-0.5 px-2 border-r border-gray-200 last:border-0';
const B = 'p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1 text-xs';
const BA = 'p-1.5 rounded bg-blue-50 text-blue-600 transition-colors flex items-center gap-1 text-xs';
const btn = (active: boolean) => active ? BA : B;

export function LayoutTab({ editor }: { editor: Editor }) {
  const currentLineHeight = editor.getAttributes('paragraph').lineHeight
    ?? editor.getAttributes('heading').lineHeight ?? '';

  return (
    <div className="flex items-center flex-wrap gap-y-1 py-1">
      {/* Alignment */}
      <div className={G}>
        <span className="text-xs text-gray-400 mr-1 font-medium">Align</span>
        {(['left', 'center', 'right', 'justify'] as const).map(align => {
          const Icon = { left: AlignLeft, center: AlignCenter, right: AlignRight, justify: AlignJustify }[align];
          return (
            <button key={align} type="button"
              onClick={() => editor.chain().focus().setTextAlign(align).run()}
              className={btn(editor.isActive({ textAlign: align }))}
              title={`Align ${align}`}>
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      {/* Line Height */}
      <div className={G}>
        <span className="text-xs text-gray-400 mr-1 font-medium">Spacing</span>
        <select
          value={currentLineHeight}
          onChange={e => {
            if (e.target.value) {
              editor.chain().focus().setLineHeight(e.target.value).run();
            } else {
              editor.chain().focus().unsetLineHeight().run();
            }
          }}
          className="h-7 text-xs border border-gray-200 rounded-md px-1 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
        >
          <option value="">Default</option>
          {LINE_HEIGHTS.map(l => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      </div>

      {/* Indent */}
      <div className={G}>
        <span className="text-xs text-gray-400 mr-1 font-medium">Indent</span>
        <button type="button"
          onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
          className={B} title="Increase indent (Tab in list)">
          <IndentIncrease className="w-4 h-4" />
        </button>
        <button type="button"
          onClick={() => editor.chain().focus().liftListItem('listItem').run()}
          className={B} title="Decrease indent (Shift+Tab in list)">
          <IndentDecrease className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
