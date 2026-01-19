import { type UploadRequestFile } from "@/types/upload-request";

export function parseUploadRequestFiles(raw: unknown): UploadRequestFile[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (
        item &&
        typeof item === "object" &&
        "fileName" in item &&
        "storagePath" in item &&
        "fileType" in item
      ) {
        return {
          fileName: String((item as Record<string, unknown>).fileName),
          storagePath: String((item as Record<string, unknown>).storagePath),
          fileType: String((item as Record<string, unknown>).fileType),
          fileSize:
            "fileSize" in item && (item as Record<string, unknown>).fileSize !== null
              ? Number((item as Record<string, unknown>).fileSize)
              : undefined,
        } satisfies UploadRequestFile;
      }
      return null;
    })
    .filter(Boolean) as UploadRequestFile[];
}

export function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value: Date | string) {
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fileSizeLabel(size?: number | null) {
  if (!size) return "—";
  const kb = size / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

