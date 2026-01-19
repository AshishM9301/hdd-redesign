import { type UploadStatus } from "@/components/upload-status-badge";

export type UploadRequestFile = {
  fileName: string;
  storagePath: string;
  fileType: string;
  fileSize?: number | null;
};

export type UploadRequest = {
  id: string;
  contactName: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  referenceNumber?: string | null;
  status: UploadStatus;
  mediaFiles: unknown;
  listing?: {
    id: string;
    referenceNumber?: string | null;
    manufacturer?: string | null;
    model?: string | null;
  } | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
};

