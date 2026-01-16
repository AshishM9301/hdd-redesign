/**
 * Storage provider interface for abstracting file storage operations
 */

import type { StorageMetadata, UploadResult } from "./types";

/**
 * File type that can be either browser File or Node.js Buffer
 */
export type StorageFile = File | Buffer;

/**
 * Interface for storage providers (Firebase, AWS S3, etc.)
 */
export interface IStorageProvider {
  /**
   * Uploads a file to storage
   * @param file - The file to upload (File or Buffer)
   * @param path - Storage path where the file should be stored
   * @param metadata - Optional metadata for the file
   * @returns Promise resolving to upload result with URL and path
   */
  upload(
    file: StorageFile,
    path: string,
    metadata?: StorageMetadata,
  ): Promise<UploadResult>;

  /**
   * Deletes a file from storage
   * @param path - Storage path of the file to delete
   * @returns Promise that resolves when deletion is complete
   */
  delete(path: string): Promise<void>;

  /**
   * Gets a URL to access a file (public or signed)
   * @param path - Storage path of the file
   * @param expiresIn - Optional expiration time in seconds for signed URLs
   * @returns Promise resolving to the file URL
   */
  getUrl(path: string, expiresIn?: number): Promise<string>;

  /**
   * Generates a thumbnail for an image file (optional)
   * @param file - The image file to generate thumbnail from
   * @param path - Storage path where thumbnail should be stored
   * @returns Promise resolving to thumbnail URL
   */
  generateThumbnail?(file: StorageFile, path: string): Promise<string>;

  /**
   * Validates a file before upload (optional)
   * @param file - The file to validate
   * @returns Promise resolving to validation result
   */
  validateFile?(file: StorageFile): Promise<{ valid: boolean; error?: string }>;
}

