"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  X,
  Play,
  Video,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export type MediaPreviewFile = {
  preview: string;
  name: string;
  type: "image" | "video";
};

type MediaPreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file?: MediaPreviewFile | null; // Legacy single-file mode (optional)
  files?: MediaPreviewFile[]; // New gallery mode
  initialIndex?: number; // Starting index for gallery mode
};

export default function MediaPreviewDialog({
  open,
  onOpenChange,
  file,
  files,
  initialIndex,
}: MediaPreviewDialogProps) {
  const [playingVideo, setPlayingVideo] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (!open) {
      setPlayingVideo(false);
    }
  }, [open]);

  const isGalleryMode = !!files && files.length > 0;
  const hasGalleryNav = isGalleryMode && (files?.length ?? 0) > 1;

  React.useEffect(() => {
    if (!open) return;
    if (isGalleryMode) {
      const idx = initialIndex ?? 0;
      const safeIdx = Math.min(Math.max(0, idx), (files?.length ?? 1) - 1);
      setCurrentIndex(safeIdx);
    }
  }, [open, isGalleryMode, initialIndex, files?.length]);

  const currentFile = isGalleryMode ? files?.[currentIndex] : file ?? null;

  React.useEffect(() => {
    if (!open) return;
    if (!isGalleryMode) return;
    // Stop any video playback when navigating in gallery
    setPlayingVideo(false);
  }, [currentIndex, open, isGalleryMode]);

  React.useEffect(() => {
    if (!open) return;
    if (currentFile?.type !== "video") {
      setPlayingVideo(false);
    }
  }, [currentFile?.type, open]);

  const goToPrevious = React.useCallback(() => {
    if (!files || files.length <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? files.length - 1 : prev - 1));
    setPlayingVideo(false);
  }, [files]);

  const goToNext = React.useCallback(() => {
    if (!files || files.length <= 1) return;
    setCurrentIndex((prev) => (prev === files.length - 1 ? 0 : prev + 1));
    setPlayingVideo(false);
  }, [files]);

  React.useEffect(() => {
    if (!open) return;
    if (!hasGalleryNav) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrevious();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, hasGalleryNav, goToPrevious, goToNext]);

  if (!currentFile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="top-0! left-0! z-[100000000] h-screen! max-h-screen! w-screen! max-w-none! translate-x-0! translate-y-0! rounded-none border-0 bg-black/20 p-0"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">
          Media Preview: {currentFile.name}
        </DialogTitle>
        <div className="relative h-full w-full bg-transparent">
          {/* Red X Close Button */}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-[100000000] rounded-full bg-red-500 p-2 text-white transition-colors hover:bg-red-600"
            aria-label="Close preview"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Media Content in 16:9 Landscape Aspect Ratio */}
          <div className="flex h-full w-full items-center justify-center p-4">
            <div className="relative aspect-video w-full max-w-[40vw]">
              {hasGalleryNav ? (
                <>
                  <button
                    type="button"
                    onClick={goToPrevious}
                    aria-label="Previous media"
                    className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur transition hover:bg-black/55"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    aria-label="Next media"
                    className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur transition hover:bg-black/55"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              ) : null}

              {currentFile.type === "image" ? (
                <img
                  src={currentFile.preview}
                  alt={currentFile.name}
                  className="h-full w-full object-cover transition-opacity"
                />
              ) : (
                <div className="relative h-full w-full">
                  {playingVideo ? (
                    <video
                      src={currentFile.preview}
                      controls
                      autoPlay
                      className="h-full w-full object-cover transition-opacity"
                      onEnded={() => setPlayingVideo(false)}
                    />
                  ) : (
                    <>
                      <video
                        src={currentFile.preview}
                        className="h-full w-full object-cover opacity-50"
                        muted
                      />
                      <button
                        type="button"
                        onClick={() => setPlayingVideo(true)}
                        className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/40"
                        aria-label="Play video"
                      >
                        <div className="rounded-full bg-white/90 p-4">
                          <Play className="ml-1 h-8 w-8 fill-black text-black" />
                        </div>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* File Name at Bottom */}
          <div className="absolute right-0 bottom-0 left-0 flex items-center gap-2 bg-black/70 px-4 py-3 text-white">
            {currentFile.type === "image" ? (
              <ImageIcon className="h-4 w-4 shrink-0" />
            ) : (
              <Video className="h-4 w-4 shrink-0" />
            )}
            <span className="truncate text-sm">{currentFile.name}</span>

            {isGalleryMode ? (
              <span className="ml-auto shrink-0 text-xs text-white/80">
                {currentFile.type === "image" ? "Image" : "Video"}{" "}
                {currentIndex + 1} of {files?.length ?? 0}
              </span>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
