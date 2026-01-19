/**
 * File validation utilities
 * 
 * Provides comprehensive file validation including type, size, and content checks
 */

import { fileTypeFromBuffer } from "file-type";
import { getFileExtension } from "@/lib/storage/utils";
import {
  ALL_ALLOWED_MEDIA_MIME_TYPES,
  ALLOWED_MEDIA_MIME_TYPES,
  MEDIA_UPLOAD_LIMITS,
} from "@/types/media";

/**
 * Allowed MIME types for file uploads
 */
export const ALLOWED_MIME_TYPES = {
  images: [...ALLOWED_MEDIA_MIME_TYPES.images],
  videos: [...ALLOWED_MEDIA_MIME_TYPES.videos],
  documents: [...ALLOWED_MEDIA_MIME_TYPES.documents],
} as const;

export const ALL_ALLOWED_MIME_TYPES = [
  ...ALL_ALLOWED_MEDIA_MIME_TYPES,
] as const;

/**
 * File size limits in bytes
 */
export const FILE_SIZE_LIMITS = {
  image: MEDIA_UPLOAD_LIMITS.imageMaxBytes,
  video: MEDIA_UPLOAD_LIMITS.videoMaxBytes,
  document: MEDIA_UPLOAD_LIMITS.documentMaxBytes,
} as const;

/**
 * Executable file extensions to reject
 */
const EXECUTABLE_EXTENSIONS = [
  ".exe",
  ".bat",
  ".sh",
  ".js",
  ".php",
  ".py",
  ".rb",
  ".jar",
  ".com",
  ".scr",
  ".vbs",
  ".cmd",
  ".ps1",
  ".msi",
  ".dll",
  ".so",
  ".dylib",
] as const;

/**
 * MIME type to file category mapping
 */
function getFileCategory(mimeType: string): "image" | "video" | "document" | null {
  if (ALLOWED_MIME_TYPES.images.includes(mimeType as (typeof ALLOWED_MIME_TYPES.images)[number])) {
    return "image";
  }
  if (ALLOWED_MIME_TYPES.videos.includes(mimeType as (typeof ALLOWED_MIME_TYPES.videos)[number])) {
    return "video";
  }
  if (ALLOWED_MIME_TYPES.documents.includes(mimeType as (typeof ALLOWED_MIME_TYPES.documents)[number])) {
    return "document";
  }
  return null;
}

/**
 * Gets the maximum file size for a given MIME type
 */
function getMaxFileSize(mimeType: string): number {
  const category = getFileCategory(mimeType);
  if (!category) {
    return FILE_SIZE_LIMITS.document; // Default to smallest limit
  }
  return FILE_SIZE_LIMITS[category];
}

/**
 * Validates file extension against executable extensions
 */
export function validateFileExtension(fileName: string): boolean {
  const extension = getFileExtension(fileName).toLowerCase();
  return !EXECUTABLE_EXTENSIONS.some((ext) => extension === ext.slice(1));
}

/**
 * Validates that file extension matches MIME type
 */
export function validateExtensionMatchesMimeType(
  fileName: string,
  mimeType: string,
): boolean {
  const extension = getFileExtension(fileName).toLowerCase();
  const extensionToMimeType: Record<string, string[]> = {
    jpg: ["image/jpeg"],
    jpeg: ["image/jpeg"],
    png: ["image/png"],
    webp: ["image/webp"],
    mp4: ["video/mp4"],
    webm: ["video/webm"],
    mov: ["video/quicktime"],
    pdf: ["application/pdf"],
  };

  const allowedMimeTypes = extensionToMimeType[extension];
  if (!allowedMimeTypes) {
    return false;
  }

  return allowedMimeTypes.includes(mimeType.toLowerCase());
}

/**
 * Validates file size based on MIME type
 */
export function validateFileSizeByType(
  fileSize: number,
  mimeType: string,
): { valid: boolean; maxSize: number; error?: string } {
  const maxSize = getMaxFileSize(mimeType);
  const valid = fileSize > 0 && fileSize <= maxSize;

  if (!valid) {
    const category = getFileCategory(mimeType) || "file";
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      maxSize,
      error: `${category} file size must not exceed ${maxSizeMB}MB`,
    };
  }

  return { valid: true, maxSize };
}

/**
 * Validates file content using file-type library
 * 
 * @param buffer - File buffer to validate
 * @param declaredMimeType - The MIME type declared by the client
 * @returns Validation result with actual MIME type
 */
export async function validateFileContent(
  buffer: Buffer,
  declaredMimeType: string,
): Promise<{
  valid: boolean;
  actualMimeType?: string;
  error?: string;
}> {
  try {
    const fileType = await fileTypeFromBuffer(buffer);

    if (!fileType) {
      return {
        valid: false,
        error: "Could not determine file type from content",
      };
    }

    const actualMimeType = fileType.mime;

    // Check if actual type is in allowed list
    if (
      !ALL_ALLOWED_MIME_TYPES.includes(
        actualMimeType as (typeof ALL_ALLOWED_MIME_TYPES)[number],
      )
    ) {
      return {
        valid: false,
        actualMimeType,
        error: `File type ${actualMimeType} is not allowed`,
      };
    }

    // Check if actual type matches declared type
    if (actualMimeType !== declaredMimeType.toLowerCase()) {
      return {
        valid: false,
        actualMimeType,
        error: `File content type (${actualMimeType}) does not match declared type (${declaredMimeType})`,
      };
    }

    return {
      valid: true,
      actualMimeType,
    };
  } catch (error) {
    return {
      valid: false,
      error: `Error validating file content: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Comprehensive file validation
 * 
 * @param buffer - File buffer
 * @param fileName - File name
 * @param declaredMimeType - Declared MIME type
 * @returns Validation result
 */
export async function validateFile(
  buffer: Buffer,
  fileName: string,
  declaredMimeType: string,
): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  // Validate MIME type is allowed
  if (
    !ALL_ALLOWED_MIME_TYPES.includes(
      declaredMimeType.toLowerCase() as (typeof ALL_ALLOWED_MIME_TYPES)[number],
    )
  ) {
    errors.push(`MIME type ${declaredMimeType} is not allowed`);
  }

  // Validate file extension is not executable
  if (!validateFileExtension(fileName)) {
    errors.push(`File extension is not allowed (executable files are rejected)`);
  }

  // Validate extension matches MIME type
  if (!validateExtensionMatchesMimeType(fileName, declaredMimeType)) {
    errors.push(`File extension does not match declared MIME type`);
  }

  // Validate file size
  const sizeValidation = validateFileSizeByType(buffer.length, declaredMimeType);
  if (!sizeValidation.valid) {
    errors.push(sizeValidation.error || "File size exceeds limit");
  }

  // Validate file content
  const contentValidation = await validateFileContent(buffer, declaredMimeType);
  if (!contentValidation.valid) {
    errors.push(contentValidation.error || "File content validation failed");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

