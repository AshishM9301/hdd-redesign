"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X, Play, Video, Image as ImageIcon } from "lucide-react";

export type MediaPreviewFile = {
  preview: string;
  name: string;
  type: "image" | "video";
};

type MediaPreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: MediaPreviewFile | null;
};

export default function MediaPreviewDialog({
  open,
  onOpenChange,
  file,
}: MediaPreviewDialogProps) {
  const [playingVideo, setPlayingVideo] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setPlayingVideo(false);
    }
  }, [open]);

  if (!file) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="top-0! left-0! z-[100000000] h-screen! max-h-screen! w-screen! max-w-none! translate-x-0! translate-y-0! rounded-none border-0 bg-black/20 p-0"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">
          Media Preview: {file.name}
        </DialogTitle>
        <div className="relative h-full w-full bg-transparent">
          {/* Red X Close Button */}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-[100000000] rounded-full bg-red-500 p-2 text-white transition-colors hover:bg-red-600"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Media Content in 16:9 Landscape Aspect Ratio */}
          <div className="flex h-full w-full items-center justify-center p-4">
            <div className="relative aspect-video w-full max-w-[40vw]">
              {file.type === "image" ? (
                <img
                  src={file.preview}
                  alt={file.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="relative h-full w-full">
                  {playingVideo ? (
                    <video
                      src={file.preview}
                      controls
                      autoPlay
                      className="h-full w-full object-cover"
                      onEnded={() => setPlayingVideo(false)}
                    />
                  ) : (
                    <>
                      <video
                        src={file.preview}
                        className="h-full w-full object-cover opacity-50"
                        muted
                      />
                      <button
                        type="button"
                        onClick={() => setPlayingVideo(true)}
                        className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/40"
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
            {file.type === "image" ? (
              <ImageIcon className="h-4 w-4 shrink-0" />
            ) : (
              <Video className="h-4 w-4 shrink-0" />
            )}
            <span className="truncate text-sm">{file.name}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
