"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
  thumbnail?: string;
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
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!open) {
      setPlayingVideo(false);
      setIsLoading(true);
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
    setIsLoading(true);
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

  const thumbSrc = currentFile.thumbnail ?? currentFile.preview;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="fixed top-0 left-0 z-50 h-screen max-h-screen w-screen sm:max-w-none translate-x-0 translate-y-0 rounded-none border-0 bg-black/20 p-0"
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
            className="absolute top-4 right-4 z-50 rounded-full bg-red-500 p-2 text-white transition-colors hover:bg-red-600"
            aria-label="Close preview"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Media Content in 16:9 Landscape Aspect Ratio */}
          <div className="flex h-full w-full items-center justify-center p-4">
            <div className="relative aspect-video w-full max-w-[min(1000px,80vw)]">
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

              <div className="relative h-full w-full overflow-hidden rounded-xl bg-black/90">
                {isLoading ? (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/40 border-t-white" />
                  </div>
                ) : null}

                {currentFile.type === "image" ? (
                  <img
                    src={currentFile.preview}
                    alt={currentFile.name}
                    className="h-full w-full object-contain transition-opacity"
                    onLoad={() => setIsLoading(false)}
                  />
                ) : (
                  <div className="relative h-full w-full bg-black">
                    {playingVideo ? (
                      <video
                        src={currentFile.preview}
                        poster={thumbSrc}
                        controls
                        autoPlay
                        className="h-full w-full object-contain transition-opacity"
                        onLoadedData={() => setIsLoading(false)}
                        onEnded={() => setPlayingVideo(false)}
                      />
                    ) : (
                      <>
                        {thumbSrc ? (
                          <img
                            src={thumbSrc}
                            alt={currentFile.name}
                            className="h-full w-full object-contain opacity-70"
                            onLoad={() => setIsLoading(false)}
                          />
                        ) : (
                          <div className="h-full w-full bg-black" />
                        )}
                        <button
                          type="button"
                          onClick={() => setPlayingVideo(true)}
                          className="absolute inset-0 flex items-center justify-center bg-black/40 transition-colors hover:bg-black/50"
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
          </div>

          {/* Thumbnails and meta */}
          {isGalleryMode ? (
            <div className="absolute right-0 bottom-0 left-0 bg-black/75 px-4 py-3 text-white backdrop-blur">
              <div className="mb-3 flex items-center gap-2">
                {currentFile.type === "image" ? (
                  <ImageIcon className="h-4 w-4 shrink-0" />
                ) : (
                  <Video className="h-4 w-4 shrink-0" />
                )}
                <span className="truncate text-sm">{currentFile.name}</span>
                <span className="ml-auto shrink-0 text-xs text-white/80">
                  {currentFile.type === "image" ? "Image" : "Video"} {currentIndex + 1} of{" "}
                  {files?.length ?? 0}
                </span>
              </div>
              <div className="relative">
                {/* fade edges (makes horizontal scroll feel nicer) */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-linear-to-r from-black/50 to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-black/50 to-transparent" />

                <ScrollArea className="w-full">
                  <div className="flex items-center gap-2 px-2 pb-2">
                    {files?.map((media, idx) => {
                      const isActive = idx === currentIndex;
                      return (
                        <button
                          key={`${media.name}-${idx}`}
                          type="button"
                          onClick={() => setCurrentIndex(idx)}
                          className={[
                            "relative h-16 w-24 shrink-0 snap-start overflow-hidden rounded-md border transition",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500",
                            isActive
                              ? "border-stone-300 ring-2 ring-yellow-700 mt-1 mb-1"
                              : "border-white/10 hover:border-white/25",
                          ].join(" ")}
                          aria-label={`Open ${media.name}`}
                        >
                          {media.type === "image" ? (
                            <img
                              src={media.thumbnail ?? media.preview}
                              alt={media.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="relative h-full w-full bg-black">
                              {media.thumbnail ? (
                                <img
                                  src={media.thumbnail}
                                  alt={media.name}
                                  className="h-full w-full object-cover opacity-80"
                                />
                              ) : (
                                <div className="h-full w-full bg-black" />
                              )}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <div className="rounded-full bg-white/90 p-2">
                                  <Play className="ml-0.5 h-5 w-5 fill-black text-black" />
                                </div>
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <ScrollBar orientation="horizontal" className="h-2" />
                </ScrollArea>
              </div>
            </div>
          ) : (
            <div className="absolute right-0 bottom-0 left-0 flex items-center gap-2 bg-black/70 px-4 py-3 text-white">
              {currentFile.type === "image" ? (
                <ImageIcon className="h-4 w-4 shrink-0" />
              ) : (
                <Video className="h-4 w-4 shrink-0" />
              )}
              <span className="truncate text-sm">{currentFile.name}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
