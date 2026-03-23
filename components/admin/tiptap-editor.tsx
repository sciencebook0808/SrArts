'use client';
/**
 * components/admin/tiptap-editor.tsx
 *
 * Admin rich text editor — TipTap v3.
 * Uses custom Cloudinary upload (NO CldUploadWidget).
 * Drag-and-drop images directly into the editor.
 * YouTube embed support.
 */
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TipImage from '@tiptap/extension-image';
import TipLink from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import YouTube from '@tiptap/extension-youtube';
import TextAlign from '@tiptap/extension-text-align';
import { useEffect, useCallback, useRef } from 'react';
import {
  Bold, Italic, Strikethrough, Code, List, ListOrdered,
  Heading2, Heading3, Quote, Undo, Redo,
  Link as LinkIcon, ImageIcon, Minus, Youtube,
  AlignLeft, AlignCenter, AlignRight, Underline as UnderlineIcon,
} from 'lucide-react';
import { uploadToCloudinary } from '@/lib/cloudinary-upload';
import { toast } from 'sonner';

interface Props {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function TiptapEditor({ content, onChange, placeholder }: Props) {
  const inlineImageRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      TipImage.configure({ inline: false, allowBase64: false }),
      TipLink.configure({ openOnClick: false, autolink: true }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      YouTube.configure({ width: 640, height: 480, allowFullscreen: true, nocookie: true }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[320px] focus:outline-none px-4 py-3',
        'data-placeholder': placeholder ?? 'Start writing…',
      },
      handleDrop(view, event, _slice, moved) {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0];
          if (file?.type.startsWith('image/')) {
            event.preventDefault();
            const toastId = toast.loading('Uploading image…');
            void uploadToCloudinary(file, 'sr_arts/admin').then(result => {
              const { schema } = view.state;
              const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
              const node = schema.nodes.image.create({ src: result.secure_url });
              const tr = view.state.tr.insert(pos?.pos ?? view.state.doc.content.size, node);
              view.dispatch(tr);
              toast.success('Image inserted!', { id: toastId });
            }).catch(() => toast.error('Upload failed', { id: toastId }));
            return true;
          }
        }
        return false;
      },
    },
    onUpdate({ editor: e }) { onChange(e.getHTML()); },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const existing = editor.isActive('link')
      ? (editor.getAttributes('link').href as string | undefined) ?? '' : '';
    const url = window.prompt('Enter URL', existing);
    if (url === null) return;
    if (!url.trim()) { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().setLink({ href: url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}` }).run();
  }, [editor]);

  const addImageByUrl = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter image URL');
    if (url?.trim()) editor.chain().focus().setImage({ src: url.trim() }).run();
  }, [editor]);

  const addYoutube = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter YouTube URL');
    if (url?.trim()) editor.chain().focus().setYoutubeVideo({ src: url.trim() }).run();
  }, [editor]);

  const handleInlineUpload = async (file: File) => {
    if (!editor) return;
    const toastId = toast.loading('Uploading image…');
    try {
      const result = await uploadToCloudinary(file, 'sr_arts/admin');
      editor.chain().focus().setImage({ src: result.secure_url }).run();
      toast.success('Inserted!', { id: toastId });
    } catch { toast.error('Upload failed', { id: toastId }); }
  };

  if (!editor) return null;

  const b = 'p-2 rounded-lg hover:bg-accent-subtle transition-colors text-foreground/70 hover:text-primary';
  const a = 'p-2 rounded-lg bg-primary text-white';
  const btn = (active: boolean) => (active ? a : b);

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Hidden file input for toolbar upload */}
      <input ref={inlineImageRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) void handleInlineUpload(f); e.target.value = ''; }} />

      <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-border bg-accent-subtle/30">
        <button type="button" onClick={() => editor.chain().focus().undo().run()} className={b} title="Undo"><Undo className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} className={b} title="Redo"><Redo className="w-4 h-4" /></button>
        <div className="w-px bg-border mx-1 self-stretch" />
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive('heading', { level: 2 }))} title="H2"><Heading2 className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive('heading', { level: 3 }))} title="H3"><Heading3 className="w-4 h-4" /></button>
        <div className="w-px bg-border mx-1 self-stretch" />
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive('bold'))} title="Bold"><Bold className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive('italic'))} title="Italic"><Italic className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btn(editor.isActive('underline'))} title="Underline"><UnderlineIcon className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={btn(editor.isActive('strike'))} title="Strike"><Strikethrough className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleCode().run()} className={btn(editor.isActive('code'))} title="Code"><Code className="w-4 h-4" /></button>
        <div className="w-px bg-border mx-1 self-stretch" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive('bulletList'))} title="Bullets"><List className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive('orderedList'))} title="Numbers"><ListOrdered className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive('blockquote'))} title="Blockquote"><Quote className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={b} title="Divider"><Minus className="w-4 h-4" /></button>
        <div className="w-px bg-border mx-1 self-stretch" />
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={btn(editor.isActive({ textAlign: 'left' }))} title="Left"><AlignLeft className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={btn(editor.isActive({ textAlign: 'center' }))} title="Center"><AlignCenter className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={btn(editor.isActive({ textAlign: 'right' }))} title="Right"><AlignRight className="w-4 h-4" /></button>
        <div className="w-px bg-border mx-1 self-stretch" />
        <button type="button" onClick={addLink} className={btn(editor.isActive('link'))} title="Link"><LinkIcon className="w-4 h-4" /></button>
        {/* Custom upload button — no Cloudinary widget */}
        <button type="button" onClick={() => inlineImageRef.current?.click()} className={b} title="Upload image (or drag into editor)"><ImageIcon className="w-4 h-4" /></button>
        <button type="button" onClick={addImageByUrl} className={b} title="Image by URL"><ImageIcon className="w-3.5 h-3.5 opacity-60" /></button>
        <button type="button" onClick={addYoutube} className={b} title="YouTube"><Youtube className="w-4 h-4" /></button>
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
          '[&_.ProseMirror_iframe]:w-full [&_.ProseMirror_iframe]:rounded-xl [&_.ProseMirror_iframe]:my-4',
        ].join(' ')}
      />
    </div>
  );
}
