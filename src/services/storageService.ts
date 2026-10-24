import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase/config';
import { MediaItem } from '../types';

const MEDIA_STORAGE_KEY = 'kns_media_library_v1';

// Supported mime types for product and category mockups
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

export interface UploadProgressCallback {
  (progressPercent: number): void;
}

export interface UploadResult {
  url: string;
  storagePath: string;
  name: string;
  size: number;
  contentType: string;
}

/**
 * Validates an image file before upload.
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type || 'unknown'}. Allowed formats: JPG, PNG, WEBP, SVG, GIF.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File is too large (${sizeMB}MB). Maximum allowed image size is 10MB.`,
    };
  }

  return { valid: true };
}

/**
 * Uploads an image file to Firebase Storage with progress tracking.
 */
export async function uploadImageToStorage(
  file: File,
  folder = 'products',
  onProgress?: UploadProgressCallback
): Promise<UploadResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image file.');
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
  const timestamp = Date.now();
  const storagePath = `uploads/${folder}/${timestamp}_${cleanName}`;
  const storageRef = ref(storage, storagePath);

  return new Promise<UploadResult>((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (onProgress) {
          onProgress(progress);
        }
      },
      (error) => {
        console.error('Firebase Storage upload error:', error);
        let errorMsg = 'Failed to upload image to Firebase Storage.';
        if (error.code === 'storage/unauthorized') {
          errorMsg = 'Storage permission denied. Ensure you are signed in as an administrator.';
        } else if (error.code === 'storage/canceled') {
          errorMsg = 'Upload was canceled.';
        } else if (error.message) {
          errorMsg = error.message;
        }
        reject(new Error(errorMsg));
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          const result: UploadResult = {
            url: downloadUrl,
            storagePath,
            name: file.name,
            size: file.size,
            contentType: file.type,
          };

          // Save to local media index
          saveMediaItem({
            id: `media-${timestamp}`,
            name: file.name,
            url: downloadUrl,
            storagePath,
            size: file.size,
            contentType: file.type,
            uploadedAt: new Date().toISOString(),
          });

          resolve(result);
        } catch (err: any) {
          reject(new Error(err?.message || 'Could not retrieve uploaded file URL.'));
        }
      }
    );
  });
}

/**
 * Saves a media item record into local media cache.
 */
export function saveMediaItem(item: MediaItem): void {
  try {
    const existing = getStoredMediaItems();
    // Avoid duplicates by URL
    const filtered = existing.filter((m) => m.url !== item.url);
    const updated = [item, ...filtered];
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save media item to local cache:', err);
  }
}

/**
 * Retrieves all stored media items.
 */
export function getStoredMediaItems(): MediaItem[] {
  try {
    const raw = localStorage.getItem(MEDIA_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to parse stored media items:', err);
    return [];
  }
}

/**
 * Deletes a media file from Firebase Storage (if path known) and from local registry.
 */
export async function deleteMediaItem(item: MediaItem): Promise<void> {
  if (item.storagePath) {
    try {
      const storageRef = ref(storage, item.storagePath);
      await deleteObject(storageRef);
    } catch (err) {
      console.warn('Could not delete file from Firebase Storage (may have already been deleted):', err);
    }
  }

  try {
    const existing = getStoredMediaItems();
    const updated = existing.filter((m) => m.id !== item.id && m.url !== item.url);
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to remove media item from storage:', err);
  }
}
