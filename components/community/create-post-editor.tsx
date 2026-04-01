'use client';
/**
 * components/community/create-post-editor.tsx
 *
 * Full-page community post creation with:
 * - TipTap rich text (bold, italic, underline, headings, lists, links,
 *   images, text-align, YouTube embeds)
 * - Custom drag-and-drop image upload (NO Cloudinary widget)
 * - Link metadata preview (OpenGraph cards auto-detected)
 * - YouTube URL detection & embed
 * - Cover photo upload via drag-drop zone
 * - Content stored as HTML
 */

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, X, Loader2, Send,
  AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline as UnderlineIcon,
  List, ListOrdered, Link2, Heading2, Heading3,
  Undo, Redo, Quote, Minus, Code, Youtube,
  ImageIcon, Strikethrough,
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TipImage from '@tiptap/extension-image';
import TipLink from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import YouTubeExt from '@tiptap/extension-youtube';
import { toast } from 'sonner';
import { ImageUploadZone } from '@/components/ui/image-upload-zone';
import { LinkPreviewCard, useDetectedUrl } from '@/components/community/link-preview-card';
import { uploadToCloudinary } from '@/lib/cloudinary-upload';

interface Props {
  defaultMode?: string;
}

export function CreatePostEditor({ defaultMode: _defaultMode }: Props) {
  const router = useRouter();
  const { user } = useUser();

  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [coverImageId,  setCoverImageId]  = useState('');
  const [saving, setSaving]               = useState(false);
  const [charCount, setCharCount]         = useState(0);
  const [plainText, setPlainText]         = useState('');
  const [linkDismissed, setLinkDismissed] = useState('');
  const [showLinkPreview, setShowLinkPreview] = useState(false);

  const foundUrl = useDetectedUrl(plainText, 800);
  const activeUrl = foundUrl && foundUrl !== linkDismissed ? foundUrl : '';

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      TipImage.configure({ inline: false, allowBase64: false }),
      TipLink.configure({ openOnClick: false, autolink: true }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      YouTubeExt.configure({
        width: 640, height: 360,
        allowFullscreen: true, nocookie: true,
      }),
    ],
    editorProps: {
      attributes: {
        class: [
          'prose prose-sm sm:prose-base max-w-none min-h-[280px] focus:outline-none',
          'px-5 py-4',
          'prose-headings:font-extrabold prose-headings:text-foreground prose-headings:tracking-tight',
          'prose-p:text-foreground/90 prose-p:leading-relaxed',
          'prose-strong:font-bold prose-strong:text-foreground',
          'prose-a:text-primary prose-a:underline prose-a:underline-offset-2',
          'prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4',
          'prose-blockquote:italic prose-blockquote:text-muted-foreground',
          'prose-ul:list-disc prose-ol:list-decimal prose-li:text-foreground/90',
          'prose-img:rounded-xl prose-img:shadow-md prose-img:my-3',
          'prose-code:bg-accent-subtle prose-code:px-1.5 prose-code:py-0.5',
          'prose-code:rounded prose-code:text-xs prose-code:font-mono',
          'prose-hr:border-border',
          '[&_iframe]:w-full [&_iframe]:rounded-xl [&_iframe]:my-3 [&_iframe]:aspect-video [&_iframe]:border-0',
        ].join(' '),
        'data-placeholder': "What's on your mind? Share your thoughts, artwork discoveries…",
      },
      handleDrop(view, event, _slice, moved) {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0];
          if (file?.type.startsWith('image/')) {
            event.preventDefault();
            const toastId = toast.loading('Uploading image…');
            void uploadToCloudinary(file, 'sr_arts/community').then(result => {
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
    onUpdate({ editor: e }) {
      const text = e.getText();
      setCharCount(text.length);
      setPlainText(text);
    },
  });

  const addLink = useCallback(() => {
    if (!editor) return;
    const existing = editor.isActive('link')
      ? (editor.getAttributes('link').href as string | undefined) ?? '' : '';
    const url = window.prompt('Enter URL', existing);
    if (url === null) return;
    if (!url.trim()) { editor.chain().focus().unsetLink().run(); return; }
    const href = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
    editor.chain().focus().setLink({ href }).run();
  }, [editor]);

  const addYouTube = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Paste YouTube URL');
    if (url?.trim()) editor.chain().focus().setYoutubeVideo({ src: url.trim() }).run();
  }, [editor]);

  const inlineImageInputRef = useRef<HTMLInputElement>(null);
  const handleInlineImage = async (file: File) => {
    if (!editor) return;
    const toastId = toast.loading('Uploading image…');
    try {
      const result = await uploadToCloudinary(file, 'sr_arts/community');
      editor.chain().focus().setImage({ src: result.secure_url }).run();
      toast.success('Image inserted!', { id: toastId });
    } catch { toast.error('Upload failed', { id: toastId }); }
  };

  const handlePublish = async () => {
    if (!editor) return;
    const text = editor.getText().trim();
    if (!text) { toast.error('Write something first!'); return; }

    setSaving(true);
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content:  editor.getHTML(),
          imageUrl: coverImageUrl || null,
          imageId:  coverImageId  || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? 'Failed');
      }
      const d = await res.json() as { post?: { slug?: string; id: string } };
      toast.success('Post published!');
      router.push(d.post?.slug ? `/community/${d.post.slug}` : '/community');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to publish');
    } finally { setSaving(false); }
  };

  if (!editor) return null;

  const tb  = 'p-2 rounded-lg hover:bg-accent-subtle transition-colors text-foreground/50 hover:text-primary';
  const ta  = 'p-2 rounded-lg bg-primary/10 text-primary';
  const btn = (active: boolean) => active ? ta : tb;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Top nav */}
      <div className="flex items-center justify-between">
        <Link href="/community" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <h1 className="text-lg font-bold">Create Post</h1>
        <div className="w-20" />
      </div>

      {/* Card */}
      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">

        {/* Author */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          {user?.imageUrl ? (
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-border">
              <Image src={user.imageUrl} alt={user.fullName ?? ''} width={40} height={40} className="object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-sm">{(user?.fullName ?? 'U')[0].toUpperCase()}</span>
            </div>
          )}
          <div>
            <p className="font-semibold text-sm">{user?.fullName ?? user?.username ?? 'You'}</p>
            <p className="text-xs text-muted-foreground">Posting to Community · Public</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-border bg-accent-subtle/20 sticky top-[72px] z-10">
          <button type="button" onClick={() => editor.chain().focus().undo().run()} className={tb} title="Undo"><Undo className="w-4 h-4" /></button>
          <button type="button" onClick={() => editor.chain().focus().redo().run()} className={tb} title="Redo"><Redo className="w-4 h-4" /></button>
          <span className="w-px h-5 bg-border mx-1 shrink-0" />
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive('heading', { level: 2 }))} title="H2"><Heading2 className="w-4 h-4" /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive('heading', { level: 3 }))} title="H3"><Heading3 className="w-4 h-4" /></button>
          <span className="w-px h-5 bg-border mx-1 shrink-0" />
          <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive('bold'))} title="Bold"><Bold className="w-4 h-4" /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive('italic'))} title="Italic"><Italic className="w-4 h-4" /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btn(editor.isActive('underline'))} title="Underline"><UnderlineIcon className="w-4 h-4" /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={btn(editor.isActive('strike'))} title="Strike"><Strikethrough className="w-4 h-4" /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleCode().run()} className={btn(editor.isActive('code'))} title="Code"><Code className="w-4 h-4" /></button>
          <span className="w-px h-5 bg-border mx-1 shrink-0" />
          <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive('bulletList'))} title="Bullet list"><List className="w-4 h-4" /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive('orderedList'))} title="Numbered list"><ListOrdered className="w-4 h-4" /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive('blockquote'))} title="Blockquote"><Quote className="w-4 h-4" /></button>
          <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={tb} title="Divider"><Minus className="w-4 h-4" /></button>
          <span className="w-px h-5 bg-border mx-1 shrink-0" />
          <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={btn(editor.isActive({ textAlign: 'left' }))} title="Left"><AlignLeft className="w-4 h-4" /></button>
          <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={btn(editor.isActive({ textAlign: 'center' }))} title="Center"><AlignCenter className="w-4 h-4" /></button>
          <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={btn(editor.isActive({ textAlign: 'right' }))} title="Right"><AlignRight className="w-4 h-4" /></button>
          <span className="w-px h-5 bg-border mx-1 shrink-0" />
          <button type="button" onClick={addLink} className={btn(editor.isActive('link'))} title="Link"><Link2 className="w-4 h-4" /></button>
          <button type="button" onClick={addYouTube} className={tb} title="Embed YouTube"><Youtube className="w-4 h-4" /></button>
          {/* Inline image — custom, NO Cloudinary widget */}
          <input ref={inlineImageInputRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) void handleInlineImage(f); e.target.value = ''; }} />
          <button type="button" onClick={() => inlineImageInputRef.current?.click()} className={tb} title="Insert image (or drag into editor)"><ImageIcon className="w-4 h-4" /></button>
        </div>

        {/* Editor */}
        <div className={[
          '[&_.ProseMirror]:min-h-[280px] [&_.ProseMirror]:focus:outline-none',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground/40',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0',
          '[&_.ProseMirror_iframe]:w-full [&_.ProseMirror_iframe]:rounded-xl [&_.ProseMirror_iframe]:my-3',
        ].join(' ')}>
          <EditorContent editor={editor} />
        </div>

        {/* Auto link preview */}
        <AnimatePresence>
          {activeUrl && !showLinkPreview && (
            <motion.div key="lp" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mx-5 mb-4">
              <LinkPreviewCard url={activeUrl} onRemove={() => { setLinkDismissed(activeUrl); }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cover image preview */}
        <AnimatePresence>
          {coverImageUrl && (
            <motion.div key="cover" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mx-5 mb-4 relative aspect-video rounded-xl overflow-hidden bg-accent-subtle">
              <Image src={coverImageUrl} alt="Cover" fill className="object-cover" sizes="700px" />
              <button type="button" onClick={() => { setCoverImageUrl(''); setCoverImageId(''); }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border bg-accent-subtle/10 space-y-3">
          {/* Cover photo drop zone */}
          {!coverImageUrl && (
            <ImageUploadZone
              folder="sr_arts/community"
              label="Add cover photo — drag & drop, click, or paste (Ctrl+V)"
              maxSizeMB={15}
              onChange={(url, id) => { setCoverImageUrl(url); setCoverImageId(id); }}
            />
          )}

          <div className="flex items-center justify-between gap-3">
            <span className={`text-xs tabular-nums ${charCount > 4500 ? 'text-red-500 font-semibold' : charCount > 3000 ? 'text-amber-500' : 'text-muted-foreground/50'}`}>
              {charCount > 0 ? `${charCount} chars` : 'Start typing…'}
            </span>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => router.back()} className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-accent-subtle transition-colors">
                Cancel
              </button>
              <button type="button" onClick={() => void handlePublish()} disabled={saving || charCount === 0}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-light disabled:opacity-50 transition-colors shadow-sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {saving ? 'Publishing…' : 'Publish Post'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground pb-4">
        Drag images into editor · Paste YouTube links to embed · URLs auto-preview as cards
      </p>
    </motion.div>
  );
}
