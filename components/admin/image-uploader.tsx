'use client';
import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';
import { Upload, X, ImageIcon } from 'lucide-react';

interface Props { value?: string; onChange: (url: string, publicId: string) => void; onRemove?: () => void; label?: string; aspectRatio?: 'square' | 'landscape' | 'portrait'; }
const ratios = { square: 'aspect-square', landscape: 'aspect-video', portrait: 'aspect-[3/4]' };

export function ImageUploader({ value, onChange, onRemove, label = 'Upload Image', aspectRatio = 'landscape' }: Props) {
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'sr_arts_uploads';
  const onSuccess = (result: unknown) => {
    const info = (result as { info?: { secure_url: string; public_id: string } }).info;
    if (info) onChange(info.secure_url, info.public_id);
  };
  return (
    <div className="space-y-2">
      {value ? (
        <div className={`relative w-full ${ratios[aspectRatio]} rounded-xl overflow-hidden border border-border bg-accent-subtle`}>
          <Image src={value} alt="Uploaded" fill className="object-cover" sizes="(max-width: 768px) 100vw, 600px" />
          {onRemove && <button type="button" onClick={onRemove} className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors"><X className="w-4 h-4" /></button>}
          <CldUploadWidget uploadPreset={preset} onSuccess={onSuccess} options={{ maxFiles: 1, resourceType: 'image', folder: 'sr_arts' }}>
            {({ open }) => <button type="button" onClick={() => open()} className="absolute bottom-2 right-2 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 text-xs font-medium hover:bg-white transition-colors shadow-sm"><Upload className="w-3 h-3" />Replace</button>}
          </CldUploadWidget>
        </div>
      ) : (
        <CldUploadWidget uploadPreset={preset} onSuccess={onSuccess} options={{ maxFiles: 1, resourceType: 'image', folder: 'sr_arts' }}>
          {({ open }) => (
            <button type="button" onClick={() => open()} className={`w-full ${ratios[aspectRatio]} flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-accent-subtle/30 hover:bg-accent-subtle hover:border-primary transition-all cursor-pointer text-muted-foreground hover:text-primary`}>
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm"><ImageIcon className="w-6 h-6" /></div>
              <div className="text-center"><p className="font-medium text-sm">{label}</p><p className="text-xs mt-1">Click to upload via Cloudinary</p></div>
            </button>
          )}
        </CldUploadWidget>
      )}
    </div>
  );
}
