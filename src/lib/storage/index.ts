/**
 * Storage Factory
 * 
 * Provides a factory pattern for getting the appropriate storage provider
 * based on environment configuration.
 */

import { env } from "@/env";
import { StorageError } from "./errors";
import type { IStorageProvider } from "./interface";
import type { StorageProviderType } from "./types";
import { AWSStorageProvider } from "./aws";
import { FirebaseStorageProvider } from "./firebase";
import { RailwayStorageProvider } from "./railway";

/**
 * Factory class for creating storage provider instances
 */
export class StorageFactory {
  private static firebaseInstance: FirebaseStorageProvider | null = null;
  private static awsInstance: AWSStorageProvider | null = null;
  private static railwayInstance: RailwayStorageProvider | null = null;

  /**
   * Gets the configured storage provider instance
   * 
   * Uses lazy initialization to create singleton instances.
   * 
   * @returns An instance of the configured storage provider
   * @throws {StorageError} If the configured provider is invalid
   */
  static getProvider(): IStorageProvider {
    const provider = env.STORAGE_PROVIDER;

    switch (provider) {
      case "railway":
        this.railwayInstance ??= new RailwayStorageProvider();
        return this.railwayInstance;
      case "firebase":
        this.firebaseInstance ??= new FirebaseStorageProvider();
        return this.firebaseInstance;

      case "aws":
        this.awsInstance ??= new AWSStorageProvider();
        return this.awsInstance;

      default:
        throw new StorageError(
          `Invalid storage provider: ${String(provider)}. Supported providers: railway, firebase, aws`,
          "INVALID_PROVIDER",
        );
    }
  }

  /**
   * Gets a specific storage provider instance by type
   * 
   * @param type - The type of storage provider to get
   * @returns An instance of the specified storage provider
   * @throws {StorageError} If the provider type is invalid
   */
  static getProviderByType(type: StorageProviderType): IStorageProvider {
    switch (type) {
      case "railway":
        this.railwayInstance ??= new RailwayStorageProvider();
        return this.railwayInstance;
      case "firebase":
        this.firebaseInstance ??= new FirebaseStorageProvider();
        return this.firebaseInstance;

      case "aws":
        this.awsInstance ??= new AWSStorageProvider();
        return this.awsInstance;

      default:
        throw new StorageError(
          `Invalid storage provider type: ${String(type)}. Supported types: railway, firebase, aws`,
          "INVALID_PROVIDER",
        );
    }
  }
}

// Re-export types and interfaces for convenience
export type { IStorageProvider, StorageFile } from "./interface";
export type {
  StorageMetadata,
  UploadResult,
  StorageProviderType,
  FileValidationResult,
  StorageConfig,
} from "./types";
export {
  StorageError,
  FileSizeExceededError,
  InvalidFileTypeError,
  UploadFailedError,
  DeleteFailedError,
  NetworkError,
} from "./errors";
export {
  validateFileSize,
  validateMimeType,
  generateStoragePath,
  extractMimeType,
  getFileExtension,
  getFileSize,
} from "./utils";
export { DEFAULT_STORAGE_CONFIG } from "./types";




