/**
 * File Upload Utilities
 *
 * This module handles file uploads for user profiles.
 *
 * DEVELOPMENT MODE (Current):
 * - Uses FileReader to convert images to data URLs for preview
 * - Stores data URLs temporarily in state/localStorage
 *
 * PRODUCTION MODE (Future):
 * - Upload to /public/uploads/profiles/ directory
 * - Or upload to cloud storage (S3, Cloudinary, etc.)
 * - Store only the URL path in database
 */

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface UploadOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
  folder?: 'profiles' | 'signatures';
}

const DEFAULT_OPTIONS: UploadOptions = {
  maxSizeMB: 5,
  allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  folder: 'profiles',
};

/**
 * Validates a file before upload
 */
export function validateFile(
  file: File,
  options: UploadOptions = DEFAULT_OPTIONS
): { valid: boolean; error?: string } {
  const maxSize = (options.maxSizeMB || 5) * 1024 * 1024;
  const allowedTypes = options.allowedTypes || DEFAULT_OPTIONS.allowedTypes!;

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${options.maxSizeMB}MB`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type must be: ${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Convert file to data URL for preview
 * Used in development mode
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Upload profile image
 *
 * DEVELOPMENT: Returns data URL for immediate preview
 * PRODUCTION: Upload to server/cloud and return URL path
 */
export async function uploadProfileImage(
  file: File,
  userId: string,
  options: UploadOptions = { ...DEFAULT_OPTIONS, folder: 'profiles' }
): Promise<UploadResult> {
  try {
    // Validate file
    const validation = validateFile(file, options);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // DEVELOPMENT MODE: Use data URL
    // TODO: In production, replace with actual server upload
    const dataURL = await fileToDataURL(file);

    // PRODUCTION MODE (Commented out - implement when backend is ready):
    /*
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('userId', userId);
    formData.append('folder', options.folder || 'profiles');

    const response = await fetch('/api/upload/profile-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const result = await response.json();
    return {
      success: true,
      url: result.url, // e.g., '/uploads/profiles/user-123-1703567890.jpg'
    };
    */

    // For now, return data URL (development mode)
    return {
      success: true,
      url: dataURL,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Upload signature image
 */
export async function uploadSignatureImage(
  file: File,
  userId: string
): Promise<UploadResult> {
  return uploadProfileImage(file, userId, {
    maxSizeMB: 2,
    allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
    folder: 'signatures',
  });
}

/**
 * Generate filename for uploaded file
 * Format: user-{userId}-{timestamp}.{extension}
 */
export function generateFileName(userId: string, originalName: string): string {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  return `user-${userId}-${timestamp}.${extension}`;
}

/**
 * Delete uploaded file
 * Used when user changes their profile picture
 */
export async function deleteUploadedFile(url: string): Promise<boolean> {
  try {
    // PRODUCTION MODE (implement when backend is ready):
    /*
    const response = await fetch('/api/upload/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    return response.ok;
    */

    // Development mode: just return true
    return true;
  } catch (error) {
    console.error('Failed to delete file:', error);
    return false;
  }
}
