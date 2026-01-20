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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type SampleImage = {
  id: string;
  fileName: string;
  storagePath: string;
  thumbnailUrl: string;
};

type SampleVideo = {
  id: string;
  fileName: string;
  storagePath: string;
  thumbnailUrl: string;
};

type SampleDocument = {
  id: string;
  name: string;
  sizeLabel: string;
  url: string;
};

export default function SampleListingPage() {
  const router = useRouter();

  const sampleListing = {
    referenceNumber: "12345",
    manufacturer: "Vermeer",
    model: "D330X500",
    year: "2008",
    condition: "Machine Only!",
    hours: "9,762 hours",
    serialNumber: "VD123456789",
    askingPrice: 479000,
    currency: "USD",
    status: "SOLD",
    city: "Fort Myers",
    stateProvince: "Florida",
    country: "United States",
    contactName: "John Doe",
    phone: "+1.239.237.3744",
    email: "sales@hddbroker.com",
    companyName: "HDD Broker LLC",
    generalDescription:
      "Clean, well-maintained drill with strong performance history.\n\nMachine is being sold as Machine Only (no tooling beyond what is listed). Starts easily, runs smoothly, and has been used on typical utility installs.\n\nAll information provided by Seller; buyer should verify prior to purchase.",
    locatingSystems: "DCI DigiTrak F5 locating system",
    mixingSystems: "Vacuum mixing system with 300-gallon tank",
    accessories: "Includes drill pipe, drill bits, and various tooling",
    trailers: "Gooseneck trailer included",
    recentWorkModifications: "Recently serviced by local Vermeer dealer",
    additionalInformation:
      "Fluids and filters changed recently. Includes spare parts box. Stored indoors when not in use.",
    pipe: "3-inch drill pipe, 20 pieces",
    features: [
      "Caterpillar C7.1 Engine",
      "Pullback Capacity: 100,000 lbs",
      "Torque: 12,000 ft-lbs",
      "Carriage Speed: 0-120 fpm",
      "Spindle Speed: 0-200 rpm",
      "Ground Drive Speed: 0-2.5 mph",
      "On-board Crane: 8,000 lb capacity",
      "Track Size: 24 inches",
    ],
    images: Array.from({ length: 48 }, (_, idx) => {
      const id = String(idx + 1);
      return {
        id,
        fileName: `photo-${id}.jpg`,
        storagePath: `https://picsum.photos/seed/${id}/800/600`,
        thumbnailUrl: `https://picsum.photos/seed/${id}/400/400`,
      } satisfies SampleImage;
    }),
    videos: [
      {
        id: "v1",
        fileName: "walkaround.mp4",
        storagePath: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
        thumbnailUrl: "https://picsum.photos/seed/video-901/800/450",
      },
      {
        id: "v2",
        fileName: "startup.mp4",
        storagePath: "https://samplelib.com/lib/preview/mp4/sample-10s.mp4",
        thumbnailUrl: "https://picsum.photos/seed/video-902/800/450",
      },
      {
        id: "v3",
        fileName: "controls.mp4",
        storagePath: "https://samplelib.com/lib/preview/mp4/sample-15s.mp4",
        thumbnailUrl: "https://picsum.photos/seed/video-903/800/450",
      },
    ] satisfies SampleVideo[],
    documents: [
      { id: "1", name: "Condition Report", sizeLabel: "376KB", url: "#" },
      { id: "2", name: "Service History", sizeLabel: "873KB", url: "#" },
    ] satisfies SampleDocument[],
  };

  const priceLabel = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: sampleListing.currency ?? "USD",
    maximumFractionDigits: 0,
  }).format(sampleListing.askingPrice);

  const mediaItems = React.useMemo<MediaPreviewFile[]>(
    () => [
      ...sampleListing.images.map((img) => ({
        preview: img.storagePath,
        name: img.fileName,
        type: "image" as const,
        thumbnail: img.thumbnailUrl,
      })),
      ...sampleListing.videos.map((video) => ({
        preview: video.storagePath,
        name: video.fileName,
        type: "video" as const,
        thumbnail: video.thumbnailUrl,
      })),
    ],
    [sampleListing.images, sampleListing.videos],
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

  const loginRequired = () => toast.error("Login required");

  const totalPhotos = sampleListing.images.length;
  const totalVideos = sampleListing.videos.length;
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
      // Use scrollIntoView to smoothly scroll the active thumbnail into view
      activeButton.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeMediaIndex]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Keep this scoped to this page: ignore typing in inputs/textareas/contenteditable.
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
        <Button
          type="button"
          variant="ghost"
          className="gap-2"
          onClick={() => router.push("/sell")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(`#${sampleListing.referenceNumber}`);
                    toast.success("Reference number copied");
                  } catch {
                    toast.error("Could not copy");
                  }
                }}
              >
                <Copy className="h-4 w-4" />
                Copy Ref
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>Copy the listing reference number</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => toast.message("Sample page (no share link)")}
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>Share this listing</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="mb-6 overflow-hidden rounded-xl border bg-muted/40">
        <div className="bg-linear-to-r from-muted/80 via-muted/40 to-muted/80 px-4 py-3 text-center text-sm font-semibold text-foreground">
          THIS IS A SAMPLE LISTING ONLY
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        {/* Left: Media + primary info */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                {sampleListing.manufacturer} {sampleListing.model} ({sampleListing.year})
              </h1>
              <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-400">
                #{sampleListing.referenceNumber}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span>{sampleListing.condition}</span>
              <span aria-hidden="true">•</span>
              <span>{sampleListing.hours}</span>
              <span aria-hidden="true">•</span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {sampleListing.city}, {sampleListing.stateProvince}, {sampleListing.country}
              </span>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="text-3xl font-extrabold tracking-tight">
                {priceLabel}{" "}
                <span className="text-base font-semibold text-muted-foreground">
                  {sampleListing.currency}
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground">
                <span>{totalPhotos} Photos</span>
                <Separator orientation="vertical" className="h-4" />
                <span>{totalVideos} Videos</span>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl  shadow backdrop-blur" style={{ backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.5)),url(/images/hand-drawn-abstract-outline-background.avif)`, backgroundSize: "cover", backgroundPosition: "center" }}>
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

              <div className="absolute left-3 top-3">
                <span className="rounded-lg bg-yellow-400 px-3 py-1 font-semibold text-yellow-900 shadow-md">
                  SOLD!
                </span>
              </div>

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

            <div className="border-b border-r border-l  rounded-b-2xl bg-black/90 p-3" style={{ backdropFilter: "blur(5px)" }}>
              <div className="flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    openMediaAtIndex(0);
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
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-stone-800 text-stone-100">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
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
                  <div>
                    <div className="text-sm font-semibold">General Description</div>
                    <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                      {sampleListing.generalDescription}
                    </p>
                  </div>
                  {[
                    ["Locating Systems", sampleListing.locatingSystems],
                    ["Mixing Systems", sampleListing.mixingSystems],
                    ["Accessories", sampleListing.accessories],
                    ["Trailers", sampleListing.trailers],
                    ["Recent Work/Modifications", sampleListing.recentWorkModifications],
                    ["Additional Information", sampleListing.additionalInformation],
                    ["Pipe", sampleListing.pipe],
                  ].map(([title, value]) => (
                    <div key={title}>
                      <div className="text-sm font-semibold">{title}</div>
                      <p className="mt-2 text-sm text-muted-foreground">{value}</p>
                    </div>
                  ))}
                  <div className="pt-2 text-xs text-muted-foreground">
                    Serial Number (seller-provided): {sampleListing.serialNumber}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="mt-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>FEATURES INCLUDE</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid list-disc gap-2 pl-6 text-sm text-muted-foreground md:grid-cols-2">
                    {sampleListing.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="photos" className="mt-4 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-3">
                  <CardTitle>PHOTOS</CardTitle>
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
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {sampleListing.images.map((img, idx) => (
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="videos" className="mt-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>VIDEOS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sampleListing.videos.map((video, videoIndex) => (
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
                        <div className="px-3 py-2 text-sm font-semibold">
                          {video.fileName}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>DOCUMENTS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sampleListing.documents.map((doc) => (
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
                          onClick={() => toast.message("Sample document (no download)")}
                        >
                          <ExternalLink className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => toast.message("Sample document (no download)")}
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="text-xs leading-relaxed text-muted-foreground">
            While HDD Broker makes every effort to ensure the accuracy of the
            information provided by our Sellers, it is ultimately the Buyer&apos;s
            responsibility to confirm all details to their satisfaction prior to
            purchase. See our terms and conditions.
          </div>
        </div>

        {/* Right: sticky actions + details */}
        <div className="space-y-4 lg:sticky lg:top-6">
          <Card className="overflow-hidden">
            <CardHeader className="space-y-2">
              <CardTitle className="text-base">Actions</CardTitle>
              <div
                className="relative overflow-hidden rounded-lg border border-white/20 bg-white/10  shadow-lg backdrop-blur-xl ring-1 ring-white/20 dark:border-slate-800/60 dark:bg-slate-900/40 dark:ring-slate-800/40"
                
                style={{
                  backgroundImage:
                    "url(/images/modern-smartphone-with-blank-screen.png)",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "110% -10%",
                  backgroundSize: "160px",
                }}
              >
                <div className="flex flex-col items-center justify-center backdrop-blur-sm px-4 py-3 bg-black/50 rounded-lg">

                <div className="text-sm text-stone-200">Call us at</div>
                <div className="text-lg font-semibold">{sampleListing.phone}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button
                asChild
                className="w-full bg-linear-to-r from-amber-600 to-amber-700 text-black hover:from-amber-600/90 hover:to-amber-700/90"
              >
                <Link href="/sell/listing-sample/request-info">Request More Info</Link>
              </Button>

              <Button
                type="button"
                className="w-full bg-linear-to-r from-gray-700 to-gray-800 text-white hover:from-gray-700/90 hover:to-gray-800/90"
                onClick={loginRequired}
              >
                Make An Offer
              </Button>
              <Button
                type="button"
                className="w-full bg-linear-to-r from-gray-700 to-gray-800 text-white hover:from-gray-700/90 hover:to-gray-800/90"
                onClick={loginRequired}
              >
                Watch Listing
              </Button>
              <Button
                type="button"
                className="w-full bg-linear-to-r from-gray-700 to-gray-800 text-white hover:from-gray-700/90 hover:to-gray-800/90"
                onClick={loginRequired}
              >
                Notify Me
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
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
                  className="block text-primary underline-offset-4 hover:underline"
                >
                  {link.label}
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Location</CardTitle>
            </CardHeader>
            <CardContent className="flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-semibold">
                  {sampleListing.city}, {sampleListing.stateProvince}
                </div>
                <div className="text-muted-foreground">{sampleListing.country}</div>
              </div>
            </CardContent>
          </Card>

          <InfoCheckMini />
        </div>
      </div>

    </div>
  );
}


