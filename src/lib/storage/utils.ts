/**
 * Utility functions for storage operations
 */

/**
 * Type guard to check if value is a Buffer
 */
function isBuffer(value: unknown): value is Buffer {
  return Buffer.isBuffer(value);
}

/**
 * Type guard to check if value is a File
 */
function isFile(value: unknown): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "size" in value &&
    "type" in value &&
    "name" in value
  );
}

/**
 * Validates if file size is within the maximum allowed size
 */
export function validateFileSize(
  file: File | Buffer,
  maxSize: number,
): boolean {
  const size = isBuffer(file) ? file.length : isFile(file) ? file.size : 0;
  return size > 0 && size <= maxSize;
}

/**
 * Validates if MIME type is in the allowed list
 */
export function validateMimeType(
  mimeType: string,
  allowedTypes: string[],
): boolean {
  return allowedTypes.includes(mimeType.toLowerCase());
}

/**
 * Generates a storage path for a file
 * Format: {prefix}/{userId}/{timestamp}-{sanitizedFileName}
 */
export function generateStoragePath(
  prefix: string,
  fileName: string,
  userId?: string,
): string {
  const timestamp = Date.now();
  const sanitizedFileName = sanitizeFileName(fileName);
  const parts = [prefix];

  if (userId) {
    parts.push(userId);
  }

  parts.push(`${timestamp}-${sanitizedFileName}`);
  return parts.join("/");
}

/**
 * Sanitizes a file name by removing invalid characters
 */
function sanitizeFileName(fileName: string): string {
  // Remove path separators and other dangerous characters
  return fileName
    .replace(/[\/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Extracts MIME type from file or buffer
 */
export function extractMimeType(
  file: File | Buffer,
  fileName?: string,
): string {
  if (isFile(file)) {
    return file.type || getMimeTypeFromExtension(fileName ?? file.name);
  }

  // For Buffer, try to infer from file name if provided
  if (fileName) {
    return getMimeTypeFromExtension(fileName);
  }

  // Default to application/octet-stream if we can't determine
  return "application/octet-stream";
}

/**
 * Gets MIME type from file extension
 */
function getMimeTypeFromExtension(fileName: string): string {
  const extension = getFileExtension(fileName).toLowerCase();
  const mimeTypes: Record<string, string> = {
    // Images
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    // Videos
    mp4: "video/mp4",
    mpeg: "video/mpeg",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    // Documents
    pdf: "application/pdf",
    doc: "application/msword",
    docx:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };

  return mimeTypes[extension] ?? "application/octet-stream";
}

/**
 * Gets file extension from file name
 */
export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot === -1 || lastDot === fileName.length - 1) {
    return "";
  }
  return fileName.slice(lastDot + 1);
}

/**
 * Gets file size from File or Buffer
 */
export function getFileSize(file: File | Buffer): number {
  return isBuffer(file) ? file.length : isFile(file) ? file.size : 0;
}

