'use client';
/**
 * components/admin/image-uploader.tsx
 *
 * Admin image uploader — custom drag-and-drop, NO Cloudinary widget.
 * Uses Cloudinary REST API directly via lib/cloudinary-upload.ts
 */
import { ImageUploadZone } from '@/components/ui/image-upload-zone';
import Image from 'next/image';

interface Props {
  value?: string;
  onChange: (url: string, publicId: string) => void;
  onRemove?: () => void;
  label?: string;
  aspectRatio?: 'square' | 'landscape' | 'portrait';
}

export function ImageUploader({
  value,
  onChange,
  onRemove,
  label = 'Upload Image',
  aspectRatio = 'landscape',
}: Props) {
  return (
    <ImageUploadZone
      value={value}
      onChange={onChange}
      onRemove={onRemove}
      folder="sr_arts/admin"
      label={label}
      maxSizeMB={20}
      className={aspectRatio === 'square' ? 'aspect-square' : aspectRatio === 'portrait' ? 'aspect-[3/4]' : 'aspect-video'}
    />
  );
}
