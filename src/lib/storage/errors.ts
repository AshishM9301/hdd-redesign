/**
 * Custom error classes for storage operations
 */

/**
 * Base error class for all storage-related errors
 */
export class StorageError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "StorageError";
    Object.setPrototypeOf(this, StorageError.prototype);
  }
}

/**
 * Error thrown when file size exceeds the maximum allowed size
 */
export class FileSizeExceededError extends StorageError {
  constructor(
    public readonly fileSize: number,
    public readonly maxSize: number,
  ) {
    super(
      `File size ${fileSize} bytes exceeds maximum allowed size of ${maxSize} bytes`,
      "FILE_SIZE_EXCEEDED",
    );
    this.name = "FileSizeExceededError";
    Object.setPrototypeOf(this, FileSizeExceededError.prototype);
  }
}

/**
 * Error thrown when file type is not allowed
 */
export class InvalidFileTypeError extends StorageError {
  constructor(
    public readonly mimeType: string,
    public readonly allowedTypes: string[],
  ) {
    super(
      `File type ${mimeType} is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
      "INVALID_FILE_TYPE",
    );
    this.name = "InvalidFileTypeError";
    Object.setPrototypeOf(this, InvalidFileTypeError.prototype);
  }
}

/**
 * Error thrown when file upload fails
 */
export class UploadFailedError extends StorageError {
  constructor(
    message: string,
    public readonly path?: string,
    cause?: unknown,
  ) {
    super(message, "UPLOAD_FAILED", cause);
    this.name = "UploadFailedError";
    Object.setPrototypeOf(this, UploadFailedError.prototype);
  }
}

/**
 * Error thrown when file deletion fails
 */
export class DeleteFailedError extends StorageError {
  constructor(
    message: string,
    public readonly path?: string,
    cause?: unknown,
  ) {
    super(message, "DELETE_FAILED", cause);
    this.name = "DeleteFailedError";
    Object.setPrototypeOf(this, DeleteFailedError.prototype);
  }
}

/**
 * Error thrown when network operation fails
 */
export class NetworkError extends StorageError {
  constructor(message: string, cause?: unknown) {
    super(message, "NETWORK_ERROR", cause);
    this.name = "NetworkError";
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

