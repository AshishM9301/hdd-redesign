"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Image as ImageIcon, Video, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ALL_ALLOWED_MEDIA_MIME_TYPES,
  MEDIA_UPLOAD_LIMITS,
} from "@/types/media";

export type MediaFile = {
  file: File;
  preview: string;
  type: "image" | "video";
};

type ImageUploadDialogProps = {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onFilesSelected?: (files: MediaFile[]) => void;
  maxFiles?: number;
  accept?: string;
  multiple?: boolean;
};

export default function ImageUploadDialog({
  children,
  open: controlledOpen,
  onOpenChange,
  onFilesSelected,
  maxFiles = 5,
  accept = "image/*,video/*",
  multiple = true,
}: ImageUploadDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [files, setFiles] = React.useState<MediaFile[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [playingVideoIndex, setPlayingVideoIndex] = React.useState<
    number | null
  >(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange : setInternalOpen;

  const handleFileSelect = (filesList: FileList | null) => {
    if (!filesList) return;

    const newFiles: MediaFile[] = [];
    const shouldReplace = maxFiles === 1 && files.length > 0;

    // If replacing, cleanup old preview URLs
    if (shouldReplace) {
      files.forEach((f) => URL.revokeObjectURL(f.preview));
      setPlayingVideoIndex(null);
    }

    const remainingSlots = shouldReplace ? maxFiles : maxFiles - files.length;
    const filesToProcess = Array.from(filesList).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      const mimeType = (file.type ?? "").toLowerCase();
      if (
        !ALL_ALLOWED_MEDIA_MIME_TYPES.includes(
          mimeType as (typeof ALL_ALLOWED_MEDIA_MIME_TYPES)[number],
        )
      ) {
        return;
      }

      const isImage = mimeType.startsWith("image/");
      const maxBytes = isImage
        ? MEDIA_UPLOAD_LIMITS.imageMaxBytes
        : MEDIA_UPLOAD_LIMITS.videoMaxBytes;

      if (file.size <= 0 || file.size > maxBytes) {
        return;
      }

      if (isImage ?? mimeType.startsWith("video/")) {
        const preview = URL.createObjectURL(file);
        const type = isImage ? "image" : "video";
        newFiles.push({ file, preview, type });
      }
    });

    if (newFiles.length > 0) {
      const updatedFiles = shouldReplace ? newFiles : [...files, ...newFiles];
      setFiles(updatedFiles);
      onFilesSelected?.(updatedFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    const fileToRemove = files[index];
    if (!fileToRemove) return;

    URL.revokeObjectURL(fileToRemove.preview);
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    if (playingVideoIndex === index) {
      setPlayingVideoIndex(null);
    } else if (playingVideoIndex !== null && playingVideoIndex > index) {
      setPlayingVideoIndex(playingVideoIndex - 1);
    }
    onFilesSelected?.(updatedFiles);
  };

  const handleClearAll = () => {
    files.forEach((file) => URL.revokeObjectURL(file.preview));
    setFiles([]);
    setPlayingVideoIndex(null);
    onFilesSelected?.([]);
  };

  const handleConfirm = () => {
    if (files.length > 0) {
      onFilesSelected?.(files);
    }
    // Reset state when closing
    setFiles([]);
    setPlayingVideoIndex(null);
    setOpen?.(false);
  };

  const handleCancel = () => {
    // Cleanup preview URLs for files that weren't confirmed
    files.forEach((file) => URL.revokeObjectURL(file.preview));
    setFiles([]);
    setPlayingVideoIndex(null);
    setOpen?.(false);
  };

  React.useEffect(() => {
    return () => {
      // Cleanup preview URLs on unmount
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Images & Videos</DialogTitle>
          <DialogDescription>
            Upload up to {maxFiles} files (images or videos). You can drag and
            drop or click to select.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drag and Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50",
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <Input
              ref={fileInputRef}
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-4">
              <div className="bg-muted rounded-full p-4">
                <Upload className="text-muted-foreground h-8 w-8" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  Drag and drop files here, or click to select
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {files.length}/{maxFiles} files selected
                </p>
              </div>
            </div>
          </div>

          {/* File Previews */}
          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Selected Files</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="h-8"
                >
                  Clear All
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {files.map((mediaFile, index) => (
                  <div
                    key={index}
                    className="group bg-muted relative aspect-square overflow-hidden rounded-lg border"
                  >
                    {mediaFile.type === "image" ? (
                      <img
                        src={mediaFile.preview}
                        alt={`Preview ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="relative h-full w-full">
                        {playingVideoIndex === index ? (
                          <video
                            src={mediaFile.preview}
                            controls
                            className="h-full w-full object-cover"
                            onEnded={() => setPlayingVideoIndex(null)}
                          />
                        ) : (
                          <>
                            <video
                              src={mediaFile.preview}
                              className="h-full w-full object-cover opacity-50"
                              muted
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPlayingVideoIndex(index);
                              }}
                              className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/40"
                            >
                              <div className="rounded-full bg-white/90 p-3">
                                <Play className="ml-1 h-6 w-6 fill-black text-black" />
                              </div>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="bg-destructive text-destructive-foreground absolute top-2 right-2 z-10 rounded-full p-1 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="absolute right-0 bottom-0 left-0 flex items-center gap-1.5 bg-black/70 p-1.5 text-xs text-white">
                      {mediaFile.type === "image" ? (
                        <ImageIcon className="h-3 w-3 shrink-0" />
                      ) : (
                        <Video className="h-3 w-3 shrink-0" />
                      )}
                      <span className="truncate">{mediaFile.file.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={files.length === 0}
          >
            Add {files.length === 1 ? "File" : `${files.length} Files`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
