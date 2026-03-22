'use client';

/**
 * components/admin/tiptap-editor.tsx
 *
 * Rich text editor built on TipTap v3 (React).
 * Supports: headings, bold, italic, strikethrough, code, lists,
 *           blockquotes, horizontal rules, links, images, and YouTube embeds.
 *
 * @tiptap/extension-youtube is verified compatible with @tiptap/core ^3.20.3
 */
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TipImage from '@tiptap/extension-image';
import TipLink from '@tiptap/extension-link';
import YouTube from '@tiptap/extension-youtube';
import { useEffect, useCallback } from 'react';
import {
  Bold, Italic, Strikethrough, Code, List, ListOrdered,
  Heading2, Heading3, Quote, Undo, Redo,
  Link as LinkIcon, ImageIcon, Minus, Youtube,
} from 'lucide-react';

interface Props {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function TiptapEditor({ content, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      TipImage.configure({ inline: false, allowBase64: true }),
      TipLink.configure({ openOnClick: false, autolink: true }),
      YouTube.configure({
        width: 640,
        height: 480,
        allowFullscreen: true,
        nocookie: true,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[320px] focus:outline-none px-4 py-3',
        'data-placeholder': placeholder ?? 'Start writing…',
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // Sync external content changes (e.g. on initial load from DB)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.isActive('link') ? editor.getAttributes('link').href as string : '';
    const url = window.prompt('Enter URL', prev);
    if (url) {
      editor.chain().focus().extendMarkToLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter image URL');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const addYoutube = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter YouTube URL (e.g. https://youtube.com/watch?v=...)');
    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
  }, [editor]);

  if (!editor) return null;

  const b = 'p-2 rounded-lg hover:bg-accent-subtle transition-colors text-foreground/70 hover:text-primary';
  const a = 'p-2 rounded-lg bg-primary text-white';
  const btn = (active: boolean) => active ? a : b;

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-border bg-accent-subtle/30">
        <button type="button" onClick={() => editor.chain().focus().undo().run()} className={b} title="Undo">
          <Undo className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} className={b} title="Redo">
          <Redo className="w-4 h-4" />
        </button>

        <div className="w-px bg-border mx-1 self-stretch" />

        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive('heading', { level: 2 }))} title="Heading 2">
          <Heading2 className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive('heading', { level: 3 }))} title="Heading 3">
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-px bg-border mx-1 self-stretch" />

        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}        className={btn(editor.isActive('bold'))}        title="Bold">
          <Bold          className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}      className={btn(editor.isActive('italic'))}      title="Italic">
          <Italic        className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()}      className={btn(editor.isActive('strike'))}      title="Strikethrough">
          <Strikethrough className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleCode().run()}        className={btn(editor.isActive('code'))}        title="Inline Code">
          <Code          className="w-4 h-4" />
        </button>

        <div className="w-px bg-border mx-1 self-stretch" />

        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}  className={btn(editor.isActive('bulletList'))}  title="Bullet List">
          <List          className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive('orderedList'))} title="Ordered List">
          <ListOrdered   className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()}  className={btn(editor.isActive('blockquote'))} title="Blockquote">
          <Quote         className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={b} title="Horizontal Rule">
          <Minus         className="w-4 h-4" />
        </button>

        <div className="w-px bg-border mx-1 self-stretch" />

        <button type="button" onClick={addLink}    className={btn(editor.isActive('link'))} title="Insert Link">
          <LinkIcon  className="w-4 h-4" />
        </button>
        <button type="button" onClick={addImage}   className={b} title="Insert Image">
          <ImageIcon className="w-4 h-4" />
        </button>
        <button type="button" onClick={addYoutube} className={b} title="Embed YouTube Video">
          <Youtube   className="w-4 h-4" />
        </button>
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className={[
          '[&_.ProseMirror]:min-h-[320px]',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0',
          // YouTube iframes
          '[&_.ProseMirror_iframe]:w-full',
          '[&_.ProseMirror_iframe]:rounded-xl',
          '[&_.ProseMirror_iframe]:my-4',
          '[&_.ProseMirror_div[data-youtube-video]]:relative',
          '[&_.ProseMirror_div[data-youtube-video]]:aspect-video',
        ].join(' ')}
      />
    </div>
  );
}
