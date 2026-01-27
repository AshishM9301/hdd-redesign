"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Camera,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  MapPin,
  Play,
  Share2,
} from "lucide-react";

import MediaPreviewDialog, { type MediaPreviewFile } from "@/components/media-preview-dialog";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type SampleImage = {
  id: string;
  fileName: string;
  storagePath: string;
  thumbnailUrl: string;
};

export type SampleVideo = {
  id: string;
  fileName: string;
  storagePath: string;
  thumbnailUrl: string;
};

export type SampleDocument = {
  id: string;
  name: string;
  sizeLabel: string;
  url: string;
};

export type ListingDetailData = {
  id?: string;
  referenceNumber?: string | null;
  manufacturer: string;
  model: string;
  year: string;
  condition: string;
  hours?: string | null;
  serialNumber: string;
  askingPrice: number | string | { toString(): string };
  currency: string;
  status: string;
  city?: string | null;
  stateProvince?: string | null;
  country?: string | null;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  companyName?: string | null;
  generalDescription?: string | null;
  locatingSystems?: string | null;
  mixingSystems?: string | null;
  accessories?: string | null;
  trailers?: string | null;
  recentWorkModifications?: string | null;
  additionalInformation?: string | null;
  pipe?: string | null;
  images: SampleImage[];
  videos: SampleVideo[];
  documents: SampleDocument[];
};

export interface ListingDetailViewProps {
  listing: ListingDetailData;
  isSampleMode?: boolean;
  backUrl?: string;
  onBack?: () => void;
  onCopyRef?: () => void;
  onShare?: () => void;
  onRequestInfo?: () => void;
  onMakeOffer?: () => void;
  onWatch?: () => void;
  onNotify?: () => void;
  onViewDocument?: (doc: SampleDocument) => void;
  onDownloadDocument?: (doc: SampleDocument) => void;
  onViewAllMedia?: () => void;
  customActions?: React.ReactNode;
}

export function ListingDetailView({
  listing,
  isSampleMode = false,
  backUrl,
  onBack,
  onCopyRef,
  onShare,
  onRequestInfo,
  onMakeOffer,
  onWatch,
  onNotify,
  onViewDocument,
  onDownloadDocument,
  onViewAllMedia,
  customActions,
}: ListingDetailViewProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Unavailable statuses for listings
  const UNAVAILABLE_STATUSES = ["SOLD", "RESERVED", "ARCHIVED"];

  // Check if listing is available for offers
  const isListingAvailable = React.useMemo(() => {
    return !UNAVAILABLE_STATUSES.includes(listing.status);
  }, [listing.status]);

  // Button disabled state: sample mode or unavailable listing
  const isMakeOfferDisabled = isSampleMode || !isListingAvailable;




  // Get disabled tooltip message
  const getMakeOfferTooltip = () => {
    if (isSampleMode) {
      return "Sample listings don't accept offers";
    }
    if (!isAuthenticated) {
      return "Login to make an offer on this listing";
    }
    if (isAuthenticated && listing.status === "PUBLISHED") {
      return "This listing is not available for offers";
    }
    return "This listing is not available for making offers";
  };


  const getWatchTooltip = () => {
    if (isSampleMode) {
      return "Sample listings don't accept watch requests";
    }

    if (isAuthenticated && listing.status === "PUBLISHED") {
      return "Watch this listing to receive notifications when it's updated";
    }
    if (!isAuthenticated) {
      return "Login to watch this listing";
    }

    return "This listing is not available for watching";
  };

  const getNotifyTooltip = () => {
    if (isSampleMode) {
      return "Sample listings don't accept notify requests";
    }
    if (isAuthenticated && listing.status === "PUBLISHED") {
      return "Notify me when this listing is updated";
    }
    return "Login to notify me when this listing is updated";
  };


  const handleMakeOffer = () => {
    if (isMakeOfferDisabled) return;

    if (!isAuthenticated) {
      // Redirect to login with callback URL
      const callbackUrl = listing.referenceNumber
        ? `/listings/${listing.referenceNumber}/make-offer`
        : `/listings/${listing.id}/make-offer`;
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    } else if (listing.referenceNumber) {
      router.push(`/listings/${listing.referenceNumber}/make-offer`);
    }
  };

  const handleWatch = () => {
    if (!isAuthenticated) {
      // Redirect to login with callback URL to current listing
      const callbackUrl = listing.referenceNumber
        ? `/listings/${listing.referenceNumber}`
        : `/listings/${listing.id}`;
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    } else if (onWatch) {
      onWatch();
    }
  };

  const handleNotify = () => {
    if (!isAuthenticated) {
      // Redirect to login with callback URL to current listing
      const callbackUrl = listing.referenceNumber
        ? `/listings/${listing.referenceNumber}`
        : `/listings/${listing.id}`;
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    } else if (onNotify) {
      onNotify();
    }
  };

  const priceLabel = React.useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: listing.currency ?? "USD",
        maximumFractionDigits: 0,
      }).format(Number(listing.askingPrice)),
    [listing.askingPrice, listing.currency],
  );

  const mediaItems = React.useMemo<MediaPreviewFile[]>(
    () => [
      ...listing.images.map((img) => ({
        preview: img.storagePath,
        name: img.fileName,
        type: "image" as const,
        thumbnail: img.thumbnailUrl,
      })),
      ...listing.videos.map((video) => ({
        preview: video.storagePath,
        name: video.fileName,
        type: "video" as const,
        thumbnail: video.thumbnailUrl,
      })),
    ],
    [listing.images, listing.videos],
  );

  const galleryFiles = mediaItems;

  const [activeMediaIndex, setActiveMediaIndex] = React.useState(0);
  const activeMediaItem = mediaItems[activeMediaIndex] ?? mediaItems[0];

  const [galleryOpen, setGalleryOpen] = React.useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = React.useState(0);

  // Ref map for thumbnail buttons to enable auto-scroll to active item
  const thumbnailButtonRefs = React.useRef<Map<number, HTMLButtonElement>>(new Map());

  const openMediaAtIndex = (index: number) => {
    setGalleryStartIndex(index);
    setGalleryOpen(true);
  };

  const handleThumbnailClick = (index: number) => {
    openMediaAtIndex(index);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backUrl) {
      window.location.href = backUrl;
    }
  };

  const handleCopyRef = async () => {
    if (onCopyRef) {
      onCopyRef();
    } else if (listing.referenceNumber) {
      try {
        await navigator.clipboard.writeText(`#${listing.referenceNumber}`);
        toast.success("Reference number copied");
      } catch {
        toast.error("Could not copy");
      }
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      toast.message("Share link copied");
    }
  };

  const totalPhotos = listing.images.length;
  const totalVideos = listing.videos.length;
  const totalMedia = totalPhotos + totalVideos;

  const goPrevMedia = React.useCallback(() => {
    setActiveMediaIndex((prev) => {
      const next = prev - 1;
      return next < 0 ? totalMedia - 1 : next;
    });
  }, [totalMedia]);

  const goNextMedia = React.useCallback(() => {
    setActiveMediaIndex((prev) => (prev + 1) % totalMedia);
  }, [totalMedia]);

  // Auto-scroll thumbnail strip to show active thumbnail when navigating with keyboard
  React.useEffect(() => {
    const activeButton = thumbnailButtonRefs.current.get(activeMediaIndex);
    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeMediaIndex]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || target?.isContentEditable) return;

      if (e.key === "ArrowLeft") goPrevMedia();
      if (e.key === "ArrowRight") goNextMedia();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNextMedia, goPrevMedia]);

  const InfoCheckMini = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">INFO CHECK</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {[
          "Complete Description",
          "Detailed Photos",
          "Videos",
          "Complete Serial No.",
          "Inspection Reports",
          "Lien Disclosures",
          "Titles",
          "Service History",
        ].map((label) => (
          <div key={label} className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span>{label}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-10">
      <MediaPreviewDialog
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        files={galleryFiles}
        initialIndex={galleryStartIndex}
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" className="gap-2" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="outline" className="gap-2" onClick={handleCopyRef}>
                <Copy className="h-4 w-4" />
                Copy Ref
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>Copy the listing reference number</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="outline" className="gap-2" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>Share this listing</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {isSampleMode && (
        <div className="mb-6 overflow-hidden rounded-full border bg-black border-yellow-400">
          <div className="bg-linear-to-r from-yellow-400/80 via-yellow-400/20 to-yellow-400/80 px-4 py-3 text-center text-sm font-semibold text-foreground backdrop-blur-sm">
            THIS IS A SAMPLE LISTING ONLY
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        {/* Left: Media + primary info */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                {listing.manufacturer} {listing.model} ({listing.year})
              </h1>
              {listing.referenceNumber && (
                <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-400">
                  #{listing.referenceNumber}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span>{listing.condition}</span>
              {listing.hours && (
                <>
                  <span aria-hidden="true">•</span>
                  <span>{listing.hours}</span>
                </>
              )}
              {listing.city && listing.stateProvince && listing.country && (
                <>
                  <span aria-hidden="true">•</span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {listing.city}, {listing.stateProvince}, {listing.country}
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="text-3xl font-extrabold tracking-tight">
                {priceLabel}{" "}
                <span className="text-base font-semibold text-muted-foreground">
                  {listing.currency}
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground">
                {totalPhotos > 0 && <span>{totalPhotos} Photos</span>}
                {totalPhotos > 0 && totalVideos > 0 && <Separator orientation="vertical" className="h-4" />}
                {totalVideos > 0 && <span>{totalVideos} Videos</span>}
              </div>
            </div>
          </div>

          <div
            className="relative overflow-hidden rounded-2xl shadow backdrop-blur"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.5)),url(/images/hand-drawn-abstract-outline-background.avif)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="relative aspect-video w-full">
              {activeMediaItem ? (
                activeMediaItem.type === "video" ? (
                  <div className="relative h-full w-full">
                    <Image
                      src={activeMediaItem.thumbnail ?? activeMediaItem.preview}
                      alt={activeMediaItem.name}
                      fill
                      className="object-cover"
                      priority
                    />
                    <button
                      type="button"
                      onClick={() => openMediaAtIndex(activeMediaIndex)}
                      className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors hover:bg-black/35"
                      aria-label={`Play ${activeMediaItem.name}`}
                    >
                      <div className="rounded-full bg-white/90 p-4">
                        <Play className="ml-1 h-8 w-8 fill-black text-black" />
                      </div>
                    </button>
                  </div>
                ) : (
                  <Image
                    src={activeMediaItem.preview}
                    alt={activeMediaItem.name}
                    fill
                    className="object-cover"
                    priority
                  />
                )
              ) : null}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/35 to-transparent" />

              {listing.status === "SOLD" && (
                <div className="absolute left-3 top-3">
                  <span className="rounded-lg bg-yellow-400 px-3 py-1 font-semibold text-yellow-900 shadow-md">
                    SOLD!
                  </span>
                </div>
              )}

              <div className="absolute inset-y-0 left-2 flex items-center">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-background/50 backdrop-blur hover:bg-background/80 border border-white/5"
                  onClick={goPrevMedia}
                  aria-label="Previous media"
                >
                  <ChevronLeft className="h-5 w-5 text-white" />
                </Button>
              </div>
              <div className="absolute inset-y-0 right-2 flex items-center">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-background/50 backdrop-blur hover:bg-background/80 border border-white/5"
                  onClick={goNextMedia}
                  aria-label="Next media"
                >
                  <ChevronRight className="h-5 w-5 text-white" />
                </Button>
              </div>

              <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="gap-2 bg-background/80 backdrop-blur hover:bg-background text-stone-600"
                  onClick={() => openMediaAtIndex(activeMediaIndex)}
                >
                  {activeMediaItem?.type === "video" ? (
                    <Play className="h-4 w-4 text-white" />
                  ) : (
                    <Camera className="h-4 w-4 text-white" />
                  )}
                  View full screen
                </Button>
                <div className="rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium text-white">
                  {activeMediaIndex + 1} / {totalMedia}
                </div>
              </div>
            </div>

            <div
              className="border-b border-r border-l rounded-b-2xl bg-black/90 p-3"
              style={{ backdropFilter: "blur(5px)" }}
            >
              <div className="flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    setGalleryStartIndex(0);
                    setGalleryOpen(true);
                  }}
                >
                  <Camera className="h-4 w-4" />
                  VIEW ALL MEDIA
                </Button>
                <div className="text-xs text-muted-foreground">Tip: use ← → to navigate.</div>
              </div>

              <div className="mt-3">
                <ScrollArea className="w-full">
                  <div className="flex gap-2 pb-3 px-1">
                    {mediaItems.map((item, idx) => {
                      const isActive = idx === activeMediaIndex;
                      return (
                        <button
                          key={`${item.type}-${idx}-${item.name}`}
                          ref={(el) => {
                            if (el) {
                              thumbnailButtonRefs.current.set(idx, el);
                            } else {
                              thumbnailButtonRefs.current.delete(idx);
                            }
                          }}
                          type="button"
                          className={cn(
                            " my-1 relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-20 sm:w-20",
                            isActive && "ring-2 ring-yellow-600 border-yellow-400",
                          )}
                          onClick={() => setActiveMediaIndex(idx)}
                          onDoubleClick={() => handleThumbnailClick(idx)}
                          aria-label={`View ${item.name}`}
                        >
                          <Image
                            src={item.thumbnail ?? item.preview}
                            alt={item.name}
                            fill
                            className="object-cover"
                            loading={idx < 12 ? "eager" : "lazy"}
                            sizes="(max-width: 640px) 64px, 80px"
                          />
                          {item.type === "video" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <Play className="h-5 w-5 fill-white text-white sm:h-6 sm:w-6" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            </div>
          </div>

          {/* Section tabs */}
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-stone-800 text-stone-100">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>DESCRIPTION</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {listing.generalDescription && (
                    <div>
                      <div className="text-sm font-semibold">General Description</div>
                      <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                        {listing.generalDescription}
                      </p>
                    </div>
                  )}
                  {[
                    ["Locating Systems", listing.locatingSystems],
                    ["Mixing Systems", listing.mixingSystems],
                    ["Accessories", listing.accessories],
                    ["Trailers", listing.trailers],
                    ["Recent Work/Modifications", listing.recentWorkModifications],
                    ["Additional Information", listing.additionalInformation],
                    ["Pipe", listing.pipe],
                  ].map(
                    ([title, value]) =>
                      value && (
                        <div key={title}>
                          <div className="text-sm font-semibold">{title}</div>
                          <p className="mt-2 text-sm text-muted-foreground">{value}</p>
                        </div>
                      ),
                  )}
                  <div className="pt-2 text-xs text-muted-foreground">
                    Serial Number (seller-provided): {listing.serialNumber}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="photos" className="mt-4 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-3">
                  <CardTitle>PHOTOS</CardTitle>
                  {totalPhotos > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2"
                      onClick={() => {
                        setGalleryStartIndex(0);
                        setGalleryOpen(true);
                      }}
                    >
                      <Camera className="h-4 w-4" />
                      VIEW ALL PHOTOS
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {totalPhotos > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                      {listing.images.map((img, idx) => (
                        <button
                          key={img.id}
                          type="button"
                          className="relative aspect-square overflow-hidden rounded-md border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          onClick={() => handleThumbnailClick(idx)}
                          aria-label={`Open ${img.fileName}`}
                        >
                          <Image
                            src={img.thumbnailUrl}
                            alt={img.fileName}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No photos available.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="videos" className="mt-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>VIDEOS</CardTitle>
                </CardHeader>
                <CardContent>
                  {totalVideos > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {listing.videos.map((video, videoIndex) => (
                        <button
                          key={video.id}
                          type="button"
                          className="group overflow-hidden rounded-lg border bg-card text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          onClick={() => openMediaAtIndex(totalPhotos + videoIndex)}
                          aria-label={`Play ${video.fileName}`}
                        >
                          <div className="relative aspect-video bg-muted">
                            <Image
                              src={video.thumbnailUrl}
                              alt={video.fileName}
                              fill
                              className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors group-hover:bg-black/35">
                              <div className="rounded-full bg-white/90 p-3">
                                <Play className="ml-0.5 h-5 w-5 fill-black text-black" />
                              </div>
                            </div>
                          </div>
                          <div className="px-3 py-2 text-sm font-semibold">{video.fileName}</div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No videos available.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>DOCUMENTS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {listing.documents && listing.documents.length > 0 ? (
                    listing.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">{doc.name}</div>
                          <div className="text-xs text-muted-foreground">{doc.sizeLabel}</div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() =>
                              onViewDocument
                                ? onViewDocument(doc)
                                : toast.message("Sample document (no view)")
                            }
                          >
                            <ExternalLink className="h-4 w-4" />
                            View
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() =>
                              onDownloadDocument
                                ? onDownloadDocument(doc)
                                : toast.message("Sample document (no download)")
                            }
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No documents available.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="text-xs leading-relaxed text-muted-foreground">
            While HDD Broker makes every effort to ensure the accuracy of the information provided
            by our Sellers, it is ultimately the Buyer&apos;s responsibility to confirm all details
            to their satisfaction prior to purchase. See our terms and conditions.
          </div>
        </div>

        {/* Right: sticky actions + details */}
        <div className="space-y-4 lg:sticky lg:top-6">
          <Card className="overflow-hidden">
            <CardHeader className="space-y-2">
              <CardTitle className="text-base">Actions</CardTitle>
              <div
                className="relative overflow-hidden rounded-lg border border-white/20 bg-white/10 shadow-lg backdrop-blur-xl ring-1 ring-white/20 dark:border-slate-800/60 dark:bg-slate-900/40 dark:ring-slate-800/40"
                style={{
                  backgroundImage: "url(/images/modern-smartphone-with-blank-screen.png)",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "110% -10%",
                  backgroundSize: "160px",
                }}
              >
                <div className="flex flex-col items-center justify-center backdrop-blur-sm px-4 py-3 bg-black/50 rounded-lg">
                  <div className="text-sm text-stone-200">Call us at</div>
                  <div className="text-lg font-semibold">{listing.phone ?? "N/A"}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-2">
              {false ? (
                customActions
              ) : (
                <>

                  <Button
                    asChild={!!onRequestInfo}
                    className="w-full bg-linear-to-r from-amber-600 to-amber-700 text-black hover:from-amber-600/90 hover:to-amber-700/90"
                  >
                    {onRequestInfo ? (
                      <Link href="#" onClick={(e) => { e.preventDefault(); onRequestInfo(); }}>
                        Request More Info
                      </Link>
                    ) : (
                      <span onClick={onRequestInfo}>Request More Info</span>
                    )}
                  </Button>

                  <Tooltip>
                    <TooltipTrigger asChild>

                      <Button
                        type="button"

                        className={cn("w-full bg-linear-to-r  cursor-pointer ", isAuthenticated ? " from-amber-600 to-amber-700 text-black hover:from-amber-600/90 hover:to-amber-700/90" : "from-gray-700 to-gray-800 text-white  hover:from-gray-700/90 hover:to-gray-800/90")} onClick={handleMakeOffer}

                      >
                        Make An Offer
                      </Button>

                    </TooltipTrigger>
                    <TooltipContent sideOffset={8}>{getMakeOfferTooltip()}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"

                        className={cn("w-full bg-linear-to-r  cursor-pointer ", isAuthenticated ? " from-amber-600 to-amber-700 text-black hover:from-amber-600/90 hover:to-amber-700/90" : "from-gray-700 to-gray-800 text-white  hover:from-gray-700/90 hover:to-gray-800/90")} onClick={handleWatch}
                      >
                        Watch Listing
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={8}>{getWatchTooltip()}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        className={cn("w-full bg-linear-to-r  cursor-pointer ", isAuthenticated ? " from-amber-600 to-amber-700 text-black hover:from-amber-600/90 hover:to-amber-700/90" : "from-gray-700 to-gray-800 text-white  hover:from-gray-700/90 hover:to-gray-800/90")}
                        onClick={handleNotify}
                      >
                        Notify Me
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={8}>{getNotifyTooltip()}</TooltipContent>
                  </Tooltip>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="gap-0">
            <CardHeader className="pb-1">
              <CardTitle className="text-base">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                { label: "Request Shipping Quote »", href: "#" },
                { label: "Financing Options »", href: "#" },
                { label: "View Equipment Specs »", href: "#" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-yellow-700 underline-offset-4 hover:underline"
                >
                  {link.label}
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card
            className="gap-0 bg-gradient-to-br from-blue-100/40 via-blue-200/50 via-blue-200/10 to-transparent py-0 border-none"
            style={{
              backgroundImage: "url(/images/folded-paper-world-map-with-red-pin.png)",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "110% -10%",
              backgroundSize: "160px",
            }}
          >
            <CardContent className="flex items-center gap-2 text-sm backdrop-blur-sm px-4 py-3 bg-black/50 rounded-lg h-full">
              <MapPin className="size-9 text-white" />
              <div>
                <div className="font-semibold">
                  {listing.city ?? "N/A"}, {listing.stateProvince ?? ""}
                </div>
                <div className="text-muted-foreground">{listing.country ?? "N/A"}</div>
              </div>
            </CardContent>
          </Card>

          <InfoCheckMini />
        </div>
      </div>
    </div>
  );
}

