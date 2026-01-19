/**
 * Railway (S3-compatible) Storage Provider
 *
 * Uses Railway bucket credentials (S3 compatible) to upload, delete, and sign
 * URLs for media files. Designed to be the default provider while keeping AWS
 * hooks ready as a fallback.
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "@/env";
import {
  DeleteFailedError,
  FileSizeExceededError,
  InvalidFileTypeError,
  NetworkError,
  UploadFailedError,
} from "./errors";
import type { IStorageProvider, StorageFile } from "./interface";
import type { StorageMetadata, UploadResult } from "./types";
import { DEFAULT_STORAGE_CONFIG } from "./types";
import {
  extractMimeType,
  getFileExtension,
  getFileSize,
  validateFileSize,
  validateMimeType,
} from "./utils";

const ALLOWED_MIME_TYPES = DEFAULT_STORAGE_CONFIG.allowedMimeTypes;
const MAX_FILE_SIZE = DEFAULT_STORAGE_CONFIG.maxFileSize;

function getS3Client() {
  return new S3Client({
    region: env.RAILWAY_S3_REGION ?? "auto",
    endpoint: env.RAILWAY_S3_ENDPOINT,
    forcePathStyle: true,
    credentials: {
      accessKeyId:
        env.RAILWAY_S3_ACCESS_KEY_ID ??
        env.AWS_ACCESS_KEY_ID ??
        "",
      secretAccessKey:
        env.RAILWAY_S3_SECRET_ACCESS_KEY ??
        env.AWS_SECRET_ACCESS_KEY ??
        "",
    },
  });
}

async function toBuffer(file: StorageFile): Promise<Buffer> {
  if (Buffer.isBuffer(file)) return file;
  if (typeof File !== "undefined" && file instanceof File) {
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
  throw new Error("Unsupported file type. Expected File or Buffer.");
}

function sanitizePath(path: string): string {
  return path.replace(/\.\./g, "").replace(/^\/+/, "").trim();
}

export class RailwayStorageProvider implements IStorageProvider {
  private client = getS3Client();
  private bucket = env.RAILWAY_S3_BUCKET ?? env.AWS_S3_BUCKET_NAME ?? "";

  async upload(
    file: StorageFile,
    path: string,
    metadata?: StorageMetadata,
  ): Promise<UploadResult> {
    try {
      const buffer = await toBuffer(file);
      const fileSize = getFileSize(file);
      const fileName =
        file instanceof File ? file.name : metadata?.customMetadata?.fileName ?? "file";
      const mimeType = metadata?.contentType ?? extractMimeType(file, fileName);

      if (!validateMimeType(mimeType, ALLOWED_MIME_TYPES)) {
        throw new InvalidFileTypeError(mimeType, ALLOWED_MIME_TYPES);
      }

      if (!validateFileSize(file, MAX_FILE_SIZE)) {
        throw new FileSizeExceededError(fileSize, MAX_FILE_SIZE);
      }

      const safePath = sanitizePath(path);

      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: safePath,
          Body: buffer,
          ContentType: mimeType,
          CacheControl: metadata?.cacheControl,
          Metadata: metadata?.customMetadata,
        }),
      );

      const url = await this.getUrl(safePath);

      return {
        url,
        path: safePath,
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

      const message =
        error instanceof Error ? error.message : "Unknown upload error";
      throw new UploadFailedError(
        `Failed to upload to Railway storage: ${message}`,
        path,
        error,
      );
    }
  }

  async delete(path: string): Promise<void> {
    try {
      const safePath = sanitizePath(path);
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: safePath,
        }),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown delete error";
      throw new DeleteFailedError(
        `Failed to delete from Railway storage: ${message}`,
        path,
        error,
      );
    }
  }

  async getUrl(path: string, expiresIn: number = 60 * 60 * 24 * 7): Promise<string> {
    try {
      const safePath = sanitizePath(path);

      // Ensure the object exists before signing
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: safePath,
        }),
      );

      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: safePath,
      });

      return await getSignedUrl(this.client, command, { expiresIn });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown URL generation error";
      throw new NetworkError(
        `Failed to generate URL for Railway storage: ${message}`,
        error,
      );
    }
  }

  async validateFile(
    file: StorageFile,
  ): Promise<{ valid: boolean; error?: string }> {
    const fileName = file instanceof File ? file.name : "file";
    const mimeType = extractMimeType(file, fileName);
    const fileSize = getFileSize(file);

    if (!validateMimeType(mimeType, ALLOWED_MIME_TYPES)) {
      return {
        valid: false,
        error: `File type ${mimeType} is not allowed.`,
      };
    }

    if (!validateFileSize(file, MAX_FILE_SIZE)) {
      return {
        valid: false,
        error: `File size ${fileSize} exceeds maximum ${MAX_FILE_SIZE}`,
      };
    }

    const extension = getFileExtension(fileName);
    if (!extension) {
      return {
        valid: false,
        error: "File extension is required.",
      };
    }

    return { valid: true };
  }
}

