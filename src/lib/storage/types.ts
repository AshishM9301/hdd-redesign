/**
 * Shared types for the storage abstraction layer
 */

/**
 * Metadata for file uploads
 */
export interface StorageMetadata {
  /** MIME type of the file */
  contentType?: string;
  /** Custom metadata key-value pairs */
  customMetadata?: Record<string, string>;
  /** Cache control header value */
  cacheControl?: string;
}

/**
 * Result returned after successful file upload
 */
export interface UploadResult {
  /** Public URL to access the uploaded file */
  url: string;
  /** Storage path/identifier for the file */
  path: string;
  /** Optional thumbnail URL for images */
  thumbnailUrl?: string;
  /** File size in bytes */
  size: number;
  /** MIME type of the uploaded file */
  mimeType: string;
}

/**
 * Supported storage provider types
 */
export type StorageProviderType = "firebase" | "aws" | "railway";

/**
 * File validation result
 */
export interface FileValidationResult {
  /** Whether the file is valid */
  valid: boolean;
  /** Error message if validation failed */
  error?: string;
}

/**
 * Storage configuration options
 */
export interface StorageConfig {
  /** Maximum file size in bytes */
  maxFileSize: number;
  /** Allowed MIME types */
  allowedMimeTypes: string[];
  /** Whether to generate thumbnails for images */
  generateThumbnails: boolean;
}

/**
 * Default storage configuration
 */
export const DEFAULT_STORAGE_CONFIG: StorageConfig = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedMimeTypes: [
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    // Videos
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/x-msvideo",
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  generateThumbnails: true,
} as const;




