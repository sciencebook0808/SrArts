'use client';
/**
 * components/editor/components/ribbon/insert-tab.tsx
 * Insert tab: Text · Tables · Media · Links · Social Blocks
 */
import { useRef, useState } from 'react';
import type { Editor } from '@tiptap/core';
import {
  Heading1, Heading2, Heading3, Heading4, Heading5, Heading6,
  Quote, Minus, Table, Link2, Image, Youtube, Instagram,
  Code2, CheckSquare,
} from 'lucide-react';
import { uploadToCloudinary } from '@/lib/cloudinary-upload';
import { toast } from 'sonner';

const G = 'flex items-center gap-0.5 px-2 border-r border-gray-200 last:border-0';
const B = 'p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1 text-xs font-medium';
const BA = 'p-1.5 rounded bg-blue-50 text-blue-600 transition-colors flex items-center gap-1 text-xs font-medium';
const btn = (active: boolean) => active ? BA : B;

interface Props {
  editor: Editor;
  uploadFolder?: string;
  enableSocial?: boolean;
  enableTables?: boolean;
}

export function InsertTab({ editor, uploadFolder = 'sr_arts', enableSocial, enableTables }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [showTablePicker, setShowTablePicker] = useState(false);

  const addLink = () => {
    const existing = editor.isActive('link')
      ? (editor.getAttributes('link').href as string) ?? '' : '';
    const url = window.prompt('Enter URL', existing);
    if (url === null) return;
    if (!url.trim()) { editor.chain().focus().unsetLink().run(); return; }
    const href = url.startsWith('http') ? url : `https://${url}`;
    editor.chain().focus().setLink({ href }).run();
  };

  const addYoutube = () => {
    const url = window.prompt('Paste YouTube URL');
    if (url?.trim()) editor.chain().focus().setYoutubeVideo({ src: url.trim() }).run();
  };

  const handleImageUpload = async (file: File) => {
    const id = toast.loading('Uploading image…');
    try {
      const r = await uploadToCloudinary(file, uploadFolder);
      editor.chain().focus().setCustomImage({ src: r.secure_url }).run();
      toast.success('Image inserted!', { id });
    } catch {
      toast.error('Upload failed', { id });
    }
  };

  const addImageUrl = () => {
    const url = window.prompt('Image URL');
    if (url?.trim()) editor.chain().focus().setCustomImage({ src: url.trim() }).run();
  };

  // Table dimension picker grid
  const TablePicker = () => (
    <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-3 min-w-max">
      <p className="text-xs text-gray-500 mb-2">{tableRows} × {tableCols} table</p>
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(8, 1.25rem)` }}>
        {Array.from({ length: 64 }, (_, i) => {
          const r = Math.floor(i / 8) + 1;
          const c = (i % 8) + 1;
          const isActive = r <= tableRows && c <= tableCols;
          return (
            <div
              key={i}
              className={`w-5 h-5 rounded-sm border cursor-pointer transition-colors ${
                isActive ? 'bg-blue-400 border-blue-500' : 'border-gray-200 hover:border-blue-300'
              }`}
              onMouseEnter={() => { setTableRows(r); setTableCols(c); }}
              onClick={() => {
                editor.chain().focus()
                  .insertTable({ rows: r, cols: c, withHeaderRow: true })
                  .run();
                setShowTablePicker(false);
              }}
            />
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex items-center flex-wrap gap-y-1 py-1">
      {/* Headings */}
      <div className={G}>
        {([1, 2, 3, 4, 5, 6] as const).map(level => {
          const icons = { 1: Heading1, 2: Heading2, 3: Heading3, 4: Heading4, 5: Heading5, 6: Heading6 };
          const Icon = icons[level];
          return (
            <button key={level} type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
              className={btn(editor.isActive('heading', { level }))}
              title={`Heading ${level}`}>
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      {/* Blocks */}
      <div className={G}>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={btn(editor.isActive('blockquote'))} title="Blockquote">
          <Quote className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={btn(editor.isActive('codeBlock'))} title="Code block">
          <Code2 className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={btn(editor.isActive('taskList'))} title="Task list">
          <CheckSquare className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={B} title="Horizontal rule">
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Tables */}
      {enableTables && (
        <div className={G}>
          <div className="relative">
            <button type="button"
              onClick={() => setShowTablePicker(v => !v)}
              className={btn(editor.isActive('table'))}>
              <Table className="w-4 h-4" />
              <span>Table</span>
            </button>
            {showTablePicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowTablePicker(false)} />
                <TablePicker />
              </>
            )}
          </div>
        </div>
      )}

      {/* Media */}
      <div className={G}>
        {/* Hidden file input */}
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) void handleImageUpload(f); e.target.value = ''; }} />

        <button type="button" onClick={() => fileRef.current?.click()} className={B} title="Upload image">
          <Image className="w-4 h-4" />
          <span>Image</span>
        </button>
        <button type="button" onClick={addImageUrl} className={B} title="Image from URL">
          <Image className="w-3.5 h-3.5 opacity-60" />
        </button>

        <button type="button" onClick={addYoutube} className={B} title="Embed YouTube video">
          <Youtube className="w-4 h-4 text-red-500" />
          <span>YouTube</span>
        </button>
      </div>

      {/* Link */}
      <div className={G}>
        <button type="button" onClick={addLink} className={btn(editor.isActive('link'))} title="Insert link">
          <Link2 className="w-4 h-4" />
          <span>Link</span>
        </button>
      </div>

      {/* Social blocks */}
      {enableSocial && (
        <div className={G}>
          <button type="button"
            onClick={() => editor.chain().focus().insertContent({ type: 'youtubeBlock', attrs: {} }).run()}
            className={B} title="YouTube planning block">
            <Youtube className="w-4 h-4 text-red-500" />
            <span>YT Block</span>
          </button>
          <button type="button"
            onClick={() => editor.chain().focus().insertContent({ type: 'instagramBlock', attrs: {} }).run()}
            className={B} title="Instagram planning block">
            <Instagram className="w-4 h-4 text-purple-500" />
            <span>IG Block</span>
          </button>
          <button type="button"
            onClick={() => editor.chain().focus().insertContent({ type: 'facebookBlock', attrs: {} }).run()}
            className={B} title="Facebook planning block">
            <span className="w-4 h-4 flex items-center justify-center text-blue-600 font-bold text-sm">f</span>
            <span>FB Block</span>
          </button>
        </div>
      )}
    </div>
  );
}
