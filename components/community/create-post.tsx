'use client';
/**
 * components/community/create-post.tsx
 * Uses CldUploadWidget for Cloudinary — consistent with ImageUploader.
 * Fixes: imageUrl || undefined → imageUrl || null for API body.
 */
import { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon, X, Loader2, Send } from 'lucide-react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { CldUploadWidget } from 'next-cloudinary';
import type { CloudinaryUploadWidgetResults } from 'next-cloudinary';

interface Props { onCreated: () => void; }

export function CreatePost({ onCreated }: Props) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [content, setContent]     = useState('');
  const [imageUrl, setImageUrl]   = useState('');
  const [imageId, setImageId]     = useState('');
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const textareaRef               = useRef<HTMLTextAreaElement>(null);

  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'sr_arts_uploads';

  const onUploadSuccess = (result: CloudinaryUploadWidgetResults) => {
    const info = result.info;
    if (info && typeof info === 'object' && 'secure_url' in info) {
      setImageUrl(info.secure_url);
      setImageId(info.public_id);
    }
  };

  const submit = async () => {
    if (!content.trim()) { setError('Write something first.'); return; }
    setSaving(true);
    setError('');
    try {
      // Send null (not undefined) for absent optional fields — JSON.stringify
      // drops undefined keys entirely which is safe for the API, but null is
      // more explicit and avoids any serialisation edge cases.
      const res = await fetch('/api/community', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content:  content.trim(),
          imageUrl: imageUrl || null,
          imageId:  imageId  || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? 'Failed');
      }
      setContent('');
      setImageUrl('');
      setImageId('');
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <div className="bg-white border border-border rounded-2xl p-5 shadow-sm flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Sign in to share with the community</p>
        <SignInButton mode="modal">
          <button className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-light transition-colors">
            Sign in
          </button>
        </SignInButton>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-start gap-3">
        {user?.imageUrl ? (
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-border">
            <Image
              src={user.imageUrl}
              alt={user.fullName ?? ''}
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-primary font-bold">
              {(user?.fullName ?? 'U').charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => { setContent(e.target.value); setError(''); }}
            placeholder={`What's on your mind, ${user?.firstName ?? 'there'}?`}
            rows={3}
            maxLength={3000}
            className="w-full text-sm bg-transparent focus:outline-none resize-none placeholder:text-muted-foreground/60 min-h-[80px]"
          />
        </div>
      </div>

      {/* Image preview */}
      <AnimatePresence>
        {imageUrl && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative aspect-video rounded-xl overflow-hidden bg-accent-subtle"
          >
            <Image
              src={imageUrl}
              alt="Attachment"
              fill
              className="object-cover"
              sizes="500px"
            />
            <button
              type="button"
              onClick={() => { setImageUrl(''); setImageId(''); }}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              aria-label="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-2">
          {/* Cloudinary upload widget */}
          <CldUploadWidget
            uploadPreset={preset}
            onSuccess={onUploadSuccess}
            options={{ maxFiles: 1, resourceType: 'image', folder: 'sr_arts' }}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-accent-subtle hover:text-primary transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
                Photo
              </button>
            )}
          </CldUploadWidget>
          <span className="text-xs text-muted-foreground">{content.length}/3000</span>
        </div>

        <div className="flex items-center gap-3">
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="button"
            onClick={() => void submit()}
            disabled={saving || !content.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-light disabled:opacity-60 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {saving ? 'Posting…' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
