'use client';
/**
 * components/admin/tiptap-editor.tsx
 *
 * Rich text editor — TipTap v3 (^3.20.3) with YouTube embeds.
 *
 * TipTap v3 API changes (verified from tiptap.dev docs, March 2026):
 *
 *   setContent(content, options) — second arg is SetContentOptions object, NOT boolean.
 *     OLD (v2): editor.commands.setContent(content, false)
 *     NEW (v3): editor.commands.setContent(content, { emitUpdate: false })
 *
 *   setLink({ href })   — set / update link on selection
 *   unsetLink()         — remove link
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
    onUpdate({ editor: e }) {
      onChange(e.getHTML());
    },
  });

  // Sync content when it changes externally (e.g. initial DB load).
  // TipTap v3: setContent second arg is SetContentOptions, not boolean.
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const existing = editor.isActive('link')
      ? (editor.getAttributes('link').href as string | undefined) ?? ''
      : '';
    const url = window.prompt('Enter URL', existing);
    if (url === null) return;
    if (url.trim() === '') {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url.trim() }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter image URL');
    if (url?.trim()) editor.chain().focus().setImage({ src: url.trim() }).run();
  }, [editor]);

  const addYoutube = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter YouTube URL (e.g. https://youtube.com/watch?v=...)');
    if (url?.trim()) editor.chain().focus().setYoutubeVideo({ src: url.trim() }).run();
  }, [editor]);

  if (!editor) return null;

  const b = 'p-2 rounded-lg hover:bg-accent-subtle transition-colors text-foreground/70 hover:text-primary';
  const a = 'p-2 rounded-lg bg-primary text-white';
  const btn = (active: boolean) => (active ? a : b);

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-white shadow-sm">
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
        <button type="button" onClick={() => editor.chain().focus().toggleCode().run()}        className={btn(editor.isActive('code'))}        title="Inline code">
          <Code          className="w-4 h-4" />
        </button>

        <div className="w-px bg-border mx-1 self-stretch" />

        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}  className={btn(editor.isActive('bulletList'))}  title="Bullet list">
          <List          className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive('orderedList'))} title="Numbered list">
          <ListOrdered   className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()}  className={btn(editor.isActive('blockquote'))} title="Blockquote">
          <Quote         className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={b} title="Divider">
          <Minus         className="w-4 h-4" />
        </button>

        <div className="w-px bg-border mx-1 self-stretch" />

        <button type="button" onClick={addLink}    className={btn(editor.isActive('link'))} title="Insert / edit link">
          <LinkIcon  className="w-4 h-4" />
        </button>
        <button type="button" onClick={addImage}   className={b} title="Insert image">
          <ImageIcon className="w-4 h-4" />
        </button>
        <button type="button" onClick={addYoutube} className={b} title="Embed YouTube">
          <Youtube   className="w-4 h-4" />
        </button>
      </div>

      <EditorContent
        editor={editor}
        className={[
          '[&_.ProseMirror]:min-h-[320px]',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0',
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
