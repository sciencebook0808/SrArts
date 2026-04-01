'use client';
/**
 * components/ui/image-upload-zone.tsx
 *
 * Professional drag-and-drop image upload component.
 * Uses Cloudinary REST API directly — no widget, no third-party UI.
 *
 * Features:
 * - Drag & drop from desktop
 * - Click to browse files
 * - Paste from clipboard (Ctrl+V)
 * - Upload progress bar
 * - Preview with remove button
 * - File size & type validation
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { ImageIcon, X, Loader2, CheckCircle2, AlertCircle, CloudUpload } from 'lucide-react';
import { uploadToCloudinary, isImageFile, type UploadProgress } from '@/lib/cloudinary-upload';

interface Props {
  value?:    string;   // current image URL
  onChange:  (url: string, publicId: string) => void;
  onRemove?: () => void;
  folder?:   string;
  maxSizeMB?: number;
  label?:    string;
  compact?:  boolean;  // smaller variant for inline use
  className?: string;
}

type UploadState = 'idle' | 'dragging' | 'uploading' | 'done' | 'error';

export function ImageUploadZone({
  value,
  onChange,
  onRemove,
  folder = 'sr_arts',
  maxSizeMB = 10,
  label = 'Drop image here or click to upload',
  compact = false,
  className = '',
}: Props) {
  const [state, setState]       = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError]       = useState('');
  const [preview, setPreview]   = useState(value ?? '');
  const inputRef                = useRef<HTMLInputElement>(null);
  const dropRef                 = useRef<HTMLDivElement>(null);

  // Keep preview in sync with external value
  useEffect(() => { setPreview(value ?? ''); }, [value]);

  // Clipboard paste support
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items ?? []);
      const imageItem = items.find(i => i.type.startsWith('image/'));
      if (imageItem) {
        const file = imageItem.getAsFile();
        if (file) void processFile(file);
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processFile = useCallback(async (file: File) => {
    if (!isImageFile(file)) {
      setError('Only image files are accepted.');
      setState('error');
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Max ${maxSizeMB} MB.`);
      setState('error');
      return;
    }

    // Local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setState('uploading');
    setError('');
    setProgress(0);

    try {
      const result = await uploadToCloudinary(file, folder, (p: UploadProgress) => {
        setProgress(p.percent);
      });
      URL.revokeObjectURL(objectUrl);
      setPreview(result.secure_url);
      setState('done');
      onChange(result.secure_url, result.public_id);
    } catch (err) {
      URL.revokeObjectURL(objectUrl);
      setPreview(value ?? '');
      setError(err instanceof Error ? err.message : 'Upload failed');
      setState('error');
    }
  }, [folder, maxSizeMB, onChange, value]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState('idle');
    const file = e.dataTransfer.files[0];
    if (file) void processFile(file);
  }, [processFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setState('dragging');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!dropRef.current?.contains(e.relatedTarget as Node)) {
      setState('idle');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void processFile(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleRemove = () => {
    setPreview('');
    setState('idle');
    setError('');
    onRemove?.();
  };

  const hasImage = !!preview && state !== 'error';

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
      />

      <AnimatePresence mode="wait">
        {/* ── Image preview ──────────────────────────────────────────── */}
        {hasImage ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className={`relative rounded-xl overflow-hidden bg-accent-subtle ${compact ? 'aspect-square' : 'aspect-video'}`}
          >
            <Image
              src={preview}
              alt="Upload preview"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 600px"
            />

            {/* Upload progress overlay */}
            {state === 'uploading' && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
                <div className="w-32 h-1.5 bg-white/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                <p className="text-white text-xs font-medium">{progress}%</p>
              </div>
            )}

            {/* Done checkmark flash */}
            {state === 'done' && (
              <motion.div
                className="absolute top-2 left-2"
                initial={{ opacity: 1, scale: 1.2 }}
                animate={{ opacity: 0, scale: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
              >
                <div className="bg-green-500 text-white rounded-full p-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            )}

            {/* Remove button */}
            {state !== 'uploading' && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white
                  flex items-center justify-center hover:bg-black/80 transition-colors shadow-md"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Re-upload button */}
            {state === 'done' && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg bg-black/60 text-white
                  text-xs font-medium hover:bg-black/80 transition-colors"
              >
                Change
              </button>
            )}
          </motion.div>
        ) : (
          /* ── Drop zone ──────────────────────────────────────────────── */
          <motion.div
            key="dropzone"
            ref={dropRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
            className={[
              'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2',
              'border-dashed cursor-pointer transition-all duration-200 select-none',
              compact ? 'h-24 p-3' : 'py-10 px-6',
              state === 'dragging'
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : state === 'error'
                  ? 'border-red-400 bg-red-50'
                  : 'border-border/60 bg-accent-subtle/30 hover:border-primary/50 hover:bg-accent-subtle/60',
            ].join(' ')}
          >
            {/* Icon */}
            <motion.div
              animate={state === 'dragging' ? { scale: 1.15, y: -4 } : { scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              {state === 'error' ? (
                <AlertCircle className="w-8 h-8 text-red-400" />
              ) : state === 'dragging' ? (
                <CloudUpload className="w-8 h-8 text-primary" />
              ) : (
                <ImageIcon className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} text-muted-foreground/50`} />
              )}
            </motion.div>

            {!compact && (
              <div className="text-center space-y-1">
                <p className={`text-sm font-medium ${state === 'error' ? 'text-red-600' : state === 'dragging' ? 'text-primary' : 'text-foreground/70'}`}>
                  {state === 'error' ? error : state === 'dragging' ? 'Release to upload' : label}
                </p>
                {state !== 'error' && state !== 'dragging' && (
                  <p className="text-xs text-muted-foreground/60">
                    PNG, JPG, GIF, WEBP — max {maxSizeMB}MB · or paste from clipboard
                  </p>
                )}
              </div>
            )}

            {compact && state === 'error' && (
              <p className="text-xs text-red-500 text-center">{error}</p>
            )}

            {/* Drag indicator ring */}
            {state === 'dragging' && (
              <motion.div
                className="absolute inset-0 rounded-xl border-2 border-primary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Standalone error (when no preview) */}
      {state === 'error' && !preview && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
