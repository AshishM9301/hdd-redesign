/**
 * Firebase Storage Provider Implementation
 * 
 * Complete implementation of Firebase Storage provider for uploading and managing
 * media files (images, videos, documents) with proper error handling, URL generation,
 * and thumbnail support.
 * 
 * @implements {IStorageProvider}
 */

import type { IStorageProvider, StorageFile } from "./interface";
import type { StorageMetadata, UploadResult } from "./types";
import {
  UploadFailedError,
  DeleteFailedError,
  NetworkError,
  FileSizeExceededError,
  InvalidFileTypeError,
} from "./errors";
import {
  validateFileSize,
  validateMimeType,
  extractMimeType,
  getFileSize,
} from "./utils";
import { DEFAULT_STORAGE_CONFIG } from "./types";
import { getFirebaseBucket } from "./firebase/config";
import {
  convertFileToBuffer,
  generateThumbnailPath,
  getFileTypeCategory,
} from "./firebase/utils";
import sharp from "sharp";

/**
 * Maximum file sizes by type (in bytes)
 */
const MAX_FILE_SIZES = {
  images: 10 * 1024 * 1024, // 10MB
  videos: 100 * 1024 * 1024, // 100MB
  documents: 10 * 1024 * 1024, // 10MB
} as const;

/**
 * Allowed MIME types by category
 */
const ALLOWED_MIME_TYPES = {
  images: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  videos: ["video/mp4", "video/webm"],
  documents: ["application/pdf"],
} as const;

/**
 * Firebase Storage Provider
 * 
 * Implements the IStorageProvider interface for Firebase Storage operations.
 */
export class FirebaseStorageProvider implements IStorageProvider {
  /**
   * Uploads a file to Firebase Storage
   * 
   * @param file - The file to upload (File or Buffer)
   * @param path - Storage path where the file should be stored
   * @param metadata - Optional metadata for the file
   * @returns Promise resolving to upload result with URL and path
   * @throws {FileSizeExceededError} If file size exceeds maximum allowed
   * @throws {InvalidFileTypeError} If file type is not allowed
   * @throws {UploadFailedError} If upload fails
   */
  async upload(
    file: StorageFile,
    path: string,
    metadata?: StorageMetadata,
  ): Promise<UploadResult> {
    try {
      // Convert File to Buffer if needed
      const buffer = await convertFileToBuffer(file);

      // Extract MIME type
      const fileName =
        file instanceof File ? file.name : metadata?.customMetadata?.fileName || "file";
      const mimeType = extractMimeType(file, fileName);

      // Validate file type
      const allAllowedTypes = [
        ...ALLOWED_MIME_TYPES.images,
        ...ALLOWED_MIME_TYPES.videos,
        ...ALLOWED_MIME_TYPES.documents,
      ];
      if (!validateMimeType(mimeType, allAllowedTypes)) {
        throw new InvalidFileTypeError(mimeType, allAllowedTypes);
      }

      // Determine file category and validate size
      const fileCategory = getFileTypeCategory(mimeType);
      const maxSize = MAX_FILE_SIZES[fileCategory];
      const fileSize = getFileSize(file);

      if (!validateFileSize(file, maxSize)) {
        throw new FileSizeExceededError(fileSize, maxSize);
      }

      // Get Firebase Storage bucket
      const bucket = getFirebaseBucket();
      const fileRef = bucket.file(path);

      // Prepare metadata
      const uploadMetadata: {
        contentType: string;
        metadata?: {
          [key: string]: string;
        };
        cacheControl?: string;
      } = {
        contentType: mimeType,
        metadata: {
          ...metadata?.customMetadata,
          listingId: metadata?.customMetadata?.listingId || "",
          fileType: fileCategory,
          uploadedAt: new Date().toISOString(),
          originalFileName: fileName,
        },
      };

      // Set cache control for images and videos
      if (fileCategory === "images" || fileCategory === "videos") {
        uploadMetadata.cacheControl = metadata?.cacheControl || "public, max-age=31536000";
      }

      // Upload file
      await fileRef.save(buffer, {
        metadata: uploadMetadata,
      });

      // Generate signed URL (1 year expiry)
      const expiresIn = 31536000; // 1 year in seconds
      const [url] = await fileRef.getSignedUrl({
        action: "read",
        expires: new Date(Date.now() + expiresIn * 1000),
      });

      // Generate thumbnail for images if enabled
      let thumbnailUrl: string | undefined;
      if (
        fileCategory === "images" &&
        DEFAULT_STORAGE_CONFIG.generateThumbnails
      ) {
        try {
          thumbnailUrl = await this.generateThumbnail(file, path);
        } catch (thumbnailError) {
          // Log but don't fail the upload if thumbnail generation fails
          console.error("Thumbnail generation failed:", thumbnailError);
        }
      }

      return {
        url,
        path,
        thumbnailUrl,
        size: fileSize,
        mimeType,
      };
    } catch (error) {
      if (
        error instanceof FileSizeExceededError ||
        error instanceof InvalidFileTypeError
      ) {
        throw error;
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown error during file upload";
      console.error("Firebase upload failed:", errorMessage);
      throw new UploadFailedError(
        `Failed to upload file to Firebase Storage: ${errorMessage}`,
        path,
        error,
      );
    }
  }

  /**
   * Deletes a file from Firebase Storage
   * 
   * @param path - Storage path of the file to delete
   * @returns Promise that resolves when deletion is complete
   * @throws {DeleteFailedError} If deletion fails
   */
  async delete(path: string): Promise<void> {
    try {
      const bucket = getFirebaseBucket();
      const fileRef = bucket.file(path);

      // Check if file exists
      const [exists] = await fileRef.exists();
      if (!exists) {
        // File doesn't exist, consider deletion successful
        return;
      }

      // Delete main file
      await fileRef.delete();

      // Try to delete thumbnail if it exists
      try {
        const thumbnailPath = generateThumbnailPath(path);
        const thumbnailRef = bucket.file(thumbnailPath);
        const [thumbnailExists] = await thumbnailRef.exists();
        if (thumbnailExists) {
          await thumbnailRef.delete();
        }
      } catch (thumbnailError) {
        // Log but don't fail if thumbnail deletion fails
        console.warn("Failed to delete thumbnail:", thumbnailError);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown error during file deletion";
      console.error("Firebase delete failed:", errorMessage);
      throw new DeleteFailedError(
        `Failed to delete file from Firebase Storage: ${errorMessage}`,
        path,
        error,
      );
    }
  }

  /**
   * Gets a signed URL to access a file in Firebase Storage
   * 
   * @param path - Storage path of the file
   * @param expiresIn - Optional expiration time in seconds (default: 1 year)
   * @returns Promise resolving to the file URL
   * @throws {NetworkError} If URL generation fails
   */
  async getUrl(path: string, expiresIn: number = 31536000): Promise<string> {
    try {
      const bucket = getFirebaseBucket();
      const fileRef = bucket.file(path);

      // Check if file exists
      const [exists] = await fileRef.exists();
      if (!exists) {
        throw new NetworkError(`File not found at path: ${path}`);
      }

      // Generate signed URL
      const [url] = await fileRef.getSignedUrl({
        action: "read",
        expires: new Date(Date.now() + expiresIn * 1000),
      });

      return url;
    } catch (error) {
      if (error instanceof NetworkError) {
        throw error;
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown error during URL generation";
      console.error("Firebase getUrl failed:", errorMessage);
      throw new NetworkError(
        `Failed to generate URL for file: ${errorMessage}`,
        error,
      );
    }
  }

  /**
   * Generates a thumbnail for an image file
   * 
   * @param file - The image file to generate thumbnail from
   * @param path - Storage path where thumbnail should be stored
   * @returns Promise resolving to thumbnail URL
   * @throws {Error} If thumbnail generation fails
   */
  async generateThumbnail(
    file: StorageFile,
    path: string,
  ): Promise<string> {
    try {
      // Convert File to Buffer if needed
      const buffer = await convertFileToBuffer(file);

      // Check if file is an image
      const mimeType = extractMimeType(
        file,
        file instanceof File ? file.name : "file",
      );
      if (!mimeType.startsWith("image/")) {
        throw new Error("Thumbnail generation only supports image files");
      }

      // Resize image to 300x300 maintaining aspect ratio
      const thumbnailBuffer = await sharp(buffer)
        .resize(300, 300, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      // Generate thumbnail path
      const thumbnailPath = generateThumbnailPath(path);

      // Get Firebase Storage bucket
      const bucket = getFirebaseBucket();
      const thumbnailRef = bucket.file(thumbnailPath);

      // Upload thumbnail
      await thumbnailRef.save(thumbnailBuffer, {
        metadata: {
          contentType: "image/jpeg",
          cacheControl: "public, max-age=31536000",
          metadata: {
            isThumbnail: "true",
            originalPath: path,
          },
        },
      });

      // Generate signed URL for thumbnail (1 year expiry)
      const expiresIn = 31536000; // 1 year in seconds
      const [thumbnailUrl] = await thumbnailRef.getSignedUrl({
        action: "read",
        expires: new Date(Date.now() + expiresIn * 1000),
      });

      return thumbnailUrl;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown error during thumbnail generation";
      console.error("Thumbnail generation failed:", errorMessage);
      throw new Error(`Failed to generate thumbnail: ${errorMessage}`);
    }
  }

  /**
   * Validates a file before upload
   * 
   * @param file - The file to validate
   * @returns Promise resolving to validation result
   */
  async validateFile(file: StorageFile): Promise<{
    valid: boolean;
    error?: string;
  }> {
    try {
      const fileName =
        file instanceof File ? file.name : "file";
      const mimeType = extractMimeType(file, fileName);
      const fileSize = getFileSize(file);

      // Check file type
      const allAllowedTypes = [
        ...ALLOWED_MIME_TYPES.images,
        ...ALLOWED_MIME_TYPES.videos,
        ...ALLOWED_MIME_TYPES.documents,
      ];
      if (!validateMimeType(mimeType, allAllowedTypes)) {
        return {
          valid: false,
          error: `File type ${mimeType} is not allowed. Allowed types: ${allAllowedTypes.join(", ")}`,
        };
      }

      // Check file size
      const fileCategory = getFileTypeCategory(mimeType);
      const maxSize = MAX_FILE_SIZES[fileCategory];
      if (!validateFileSize(file, maxSize)) {
        return {
          valid: false,
          error: `File size ${fileSize} bytes exceeds maximum allowed size of ${maxSize} bytes for ${fileCategory}`,
        };
      }

      return { valid: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown error during file validation";
      return {
        valid: false,
        error: `File validation failed: ${errorMessage}`,
      };
    }
  }
}
