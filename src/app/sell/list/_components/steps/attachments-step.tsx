"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import type { ListingFormData } from "../listing-form";
import { Button } from "@/components/ui/button";
import ImageUploadDialog, {
  type MediaFile,
} from "@/components/image-upload-dialog";
import MediaPreviewDialog from "@/components/media-preview-dialog";
import { Upload, Image as ImageIcon, Video, X, Play } from "lucide-react";

const MAX_FILES = 5;

export default function AttachmentsStep() {
  const { watch, setValue } = useFormContext<ListingFormData>();
  const attachments = watch("attachments") ?? [];
  const [uploadedFiles, setUploadedFiles] = React.useState<
    (MediaFile | null)[]
  >(Array.from({ length: MAX_FILES }, () => null));
  const [previewIndex, setPreviewIndex] = React.useState<number | null>(null);

  // Initialize from form data only on mount
  React.useEffect(() => {
    if (attachments.length > 0) {
      const files: (MediaFile | null)[] = Array.from(
        { length: MAX_FILES },
        () => null,
      );
      attachments.forEach((file: File, index: number) => {
        if (index < MAX_FILES) {
          files[index] = {
            file,
            preview: URL.createObjectURL(file),
            type: file.type.startsWith("image/") ? "image" : "video",
          };
        }
      });
      setUploadedFiles(files);
    }
  }, []);

  // Cleanup preview URLs on unmount
  React.useEffect(() => {
    return () => {
      uploadedFiles.forEach((file) => {
        if (file) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [uploadedFiles]);

  const handleFileSelected = (fileIndex: number) => (files: MediaFile[]) => {
    if (files.length > 0) {
      const newFile = files[0];
      const updatedFiles: (MediaFile | null)[] = [...uploadedFiles];
      // Cleanup old preview URL if replacing
      const oldFile = updatedFiles[fileIndex];
      if (oldFile) {
        URL.revokeObjectURL(oldFile.preview);
      }
      // Use Object.assign to ensure type safety
      Object.assign(updatedFiles, { [fileIndex]: newFile });
      setUploadedFiles(updatedFiles);

      // Update form with only non-null files
      const fileArray = updatedFiles
        .filter((f): f is MediaFile => f !== null)
        .map((f) => f.file);
      setValue("attachments", fileArray);
    }
  };

  const removeFile = (index: number) => {
    const fileToRemove = uploadedFiles[index];
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.preview);
      const updatedFiles = [...uploadedFiles];
      updatedFiles[index] = null;
      setUploadedFiles(updatedFiles);

      // Update form with only non-null files
      const fileArray = updatedFiles
        .filter((f): f is MediaFile => f !== null)
        .map((f) => f.file);
      setValue("attachments", fileArray);

      if (previewIndex === index) {
        setPreviewIndex(null);
      }
    }
  };

  const previewFile =
    previewIndex !== null ? uploadedFiles[previewIndex] : null;

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        If you have any pictures or files (such as condition reports or other
        useful documents that will promote your listing), you can send up to
        five files at a time.
      </p>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">ATTACHMENTS</h3>
        <ul className="text-muted-foreground list-disc space-y-2 pl-6 text-sm">
          <li>
            For each file, click the Browse button to select a picture or video.
          </li>
          <li>Click to view the uploaded file.</li>
          <li>If you have more than five files, simply repeat the process.</li>
          <li>
            If you have no files to send or you have completed adding them,
            click Next.
          </li>
        </ul>
      </div>

      <div className="space-y-4">
        {Array.from({ length: MAX_FILES }, (_, index) => {
          const file = uploadedFiles[index];
          return (
            <div key={index} className="flex items-center gap-4">
              <label className="w-20 shrink-0 font-medium">
                File {index + 1}:
              </label>
              <div className="relative flex flex-1 items-center gap-2">
                {file ? (
                  <>
                    {file.type === "image" ? (
                      <button
                        type="button"
                        onClick={() => setPreviewIndex(index)}
                        className="group relative h-20 w-20 shrink-0 overflow-hidden rounded border transition-opacity hover:opacity-80"
                      >
                        <img
                          src={file.preview}
                          alt={file.file.name}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPreviewIndex(index)}
                        className="text-muted-foreground hover:text-foreground flex flex-1 items-center gap-2 rounded border px-3 py-2 text-left text-sm transition-colors"
                      >
                        <Video className="h-4 w-4 shrink-0" />
                        <span className="truncate">{file.file.name}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="hover:text-destructive hover:bg-background absolute -top-2 left-16 z-50 rounded-full border border-red-500 bg-red-500 p-1 text-white transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <ImageUploadDialog
                    onFilesSelected={handleFileSelected(index)}
                    maxFiles={1}
                    accept="image/*,video/*"
                    multiple={false}
                  >
                    <Button type="button" variant="outline" size="sm">
                      Browse
                    </Button>
                  </ImageUploadDialog>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Dialog */}
      <MediaPreviewDialog
        open={previewIndex !== null}
        onOpenChange={(open) => !open && setPreviewIndex(null)}
        file={
          previewFile
            ? {
                preview: previewFile.preview,
                name: previewFile.file.name,
                type: previewFile.type,
              }
            : null
        }
      />
    </div>
  );
}
