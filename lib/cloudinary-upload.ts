/**
 * lib/cloudinary-upload.ts
 *
 * Direct Cloudinary upload via their REST API — NO widget, NO CldUploadWidget.
 * Uses unsigned uploads with an upload_preset.
 *
 * Works with: File objects, Blob, base64 data URLs, or remote URLs.
 */

export interface CloudinaryUploadResult {
  secure_url:  string;
  public_id:   string;
  width:       number;
  height:      number;
  format:      string;
  bytes:       number;
  resource_type: string;
}

export interface UploadProgress {
  loaded: number;
  total:  number;
  percent: number;
}

/**
 * Upload a file directly to Cloudinary using unsigned preset.
 * @param file       - File | Blob | string (URL or data URL)
 * @param folder     - Cloudinary folder path
 * @param onProgress - Upload progress callback
 */
export async function uploadToCloudinary(
  file: File | Blob | string,
  folder = 'sr_arts',
  onProgress?: (progress: UploadProgress) => void
): Promise<CloudinaryUploadResult> {
  const cloudName  = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'sr_arts_uploads';

  if (!cloudName) throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set');

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const formData = new FormData();
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  if (typeof file === 'string') {
    // Remote URL or data URL
    formData.append('file', file);
  } else {
    formData.append('file', file);
  }

  // Use XMLHttpRequest for progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          onProgress({
            loaded:  e.loaded,
            total:   e.total,
            percent: Math.round((e.loaded / e.total) * 100),
          });
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText) as CloudinaryUploadResult;
        resolve(data);
      } else {
        const err = JSON.parse(xhr.responseText) as { error?: { message: string } };
        reject(new Error(err.error?.message ?? `Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
    xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

    xhr.send(formData);
  });
}

/** Quick check if a file is an acceptable image */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/** Format bytes → human readable */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
