/**
 * Firebase Storage utility functions
 * 
 * Helper functions specific to Firebase Storage operations
 */

import type { StorageFile } from "../interface";

/**
 * Converts a File object to a Buffer
 * 
 * @param file - The file to convert (File or Buffer)
 * @returns Promise resolving to Buffer
 */
export async function convertFileToBuffer(
  file: StorageFile,
): Promise<Buffer> {
  if (Buffer.isBuffer(file)) {
    return file;
  }

  if (file instanceof File) {
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  throw new Error("Unsupported file type. Expected File or Buffer.");
}

/**
 * Sanitizes a filename for Firebase Storage
 * 
 * Removes invalid characters and ensures the filename is safe for storage.
 * 
 * @param fileName - The original filename
 * @returns Sanitized filename
 */
export function sanitizeFilename(fileName: string): string {
  // Remove path separators and other dangerous characters
  return fileName
    .replace(/[\/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

/**
 * Generates a storage path for Firebase Storage
 * 
 * Format: listings/{listingId}/{type}/{timestamp}-{sanitizedFileName}
 * 
 * @param listingId - The listing ID
 * @param fileType - The type of file (images, videos, documents)
 * @param fileName - The original filename
 * @returns Generated storage path
 */
export function generateFirebaseStoragePath(
  listingId: string,
  fileType: "images" | "videos" | "documents",
  fileName: string,
): string {
  const timestamp = Date.now();
  const sanitizedFileName = sanitizeFilename(fileName);
  return `listings/${listingId}/${fileType}/${timestamp}-${sanitizedFileName}`;
}

/**
 * Generates a thumbnail path from a main file path
 * 
 * @param filePath - The main file path
 * @returns Thumbnail path
 */
export function generateThumbnailPath(filePath: string): string {
  const pathParts = filePath.split("/");
  const fileName = pathParts[pathParts.length - 1];
  const directory = pathParts.slice(0, -1).join("/");
  return `${directory}/thumbnails/${fileName}`;
}

/**
 * Determines file type category from MIME type
 * 
 * @param mimeType - The MIME type of the file
 * @returns File type category
 */
export function getFileTypeCategory(
  mimeType: string,
): "images" | "videos" | "documents" {
  if (mimeType.startsWith("image/")) {
    return "images";
  }
  if (mimeType.startsWith("video/")) {
    return "videos";
  }
  return "documents";
}






