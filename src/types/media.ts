/**
 * Shared upload constraints for media files (client + server).
 *
 * Keep this file dependency-free so it can be imported from both RSC/client
 * components and server routers.
 */

export const MEDIA_UPLOAD_LIMITS = {
    imageMaxBytes: 10 * 1024 * 1024, // 10MB
    videoMaxBytes: 100 * 1024 * 1024, // 100MB
    documentMaxBytes: 5 * 1024 * 1024, // 5MB
} as const;

export const ALLOWED_MEDIA_MIME_TYPES = {
    images: ["image/jpeg", "image/png", "image/webp"] as const,
    videos: ["video/mp4", "video/webm", "video/quicktime"] as const,
    documents: ["application/pdf"] as const,
} as const;

export const ALL_ALLOWED_MEDIA_MIME_TYPES = [
    ...ALLOWED_MEDIA_MIME_TYPES.images,
    ...ALLOWED_MEDIA_MIME_TYPES.videos,
    ...ALLOWED_MEDIA_MIME_TYPES.documents,
] as const;




