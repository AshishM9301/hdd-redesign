"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { ListingStatusBadge } from "@/components/listing-status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Loader2, ArrowLeft, CheckCircle2, Archive, Link as LinkIcon } from "lucide-react";
import Image from "next/image";
import MediaPreviewDialog from "@/components/media-preview-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ListingStatus, MediaFileType } from "@/types/listing";
import { useAuth } from "@/hooks/use-auth";

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const identifier = params.id as string; // Can be ID or reference number
  const { user } = useAuth();

  // Check if identifier looks like a reference number (starts with REF-)
  const isReferenceNumber = identifier.startsWith("REF-");

  // Try getById first if it's not a reference number
  const getByIdQuery = api.listing.getById.useQuery(
    { listingId: identifier },
    { enabled: !isReferenceNumber },
  );

  // Try getByReference if it looks like a reference number
  const getByReferenceQuery = api.listing.getByReference.useQuery(
    { referenceNumber: identifier },
    { enabled: isReferenceNumber },
  );

  // Use the appropriate query result
  const listingQuery = isReferenceNumber ? getByReferenceQuery : getByIdQuery;
  const { data: listing, isLoading, error } = listingQuery;

  const markAsSoldMutation = api.listing.markAsSold.useMutation({
    onSuccess: () => {
      toast.success("Listing marked as sold!");
      void listingQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to mark listing as sold");
    },
  });

  const archiveMutation = api.listing.archive.useMutation({
    onSuccess: () => {
      toast.success("Listing archived!");
      void listingQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to archive listing");
    },
  });

  const linkListingMutation = api.listing.linkListingToAccount.useMutation({
    onSuccess: () => {
      toast.success("Listing successfully linked to your account!");
      void listingQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to link listing to account");
    },
  });

  const [soldPrice, setSoldPrice] = React.useState("");
  const [soldTo, setSoldTo] = React.useState("");
  const [soldNotes, setSoldNotes] = React.useState("");
  const [previewIndex, setPreviewIndex] = React.useState<number | null>(null);

  const handleMarkAsSold = () => {
    if (!listing) return;
    markAsSoldMutation.mutate({
      listingId: listing.id,
      soldPrice: soldPrice ?? undefined,
      soldTo: soldTo ?? undefined,
      soldNotes: soldNotes ?? undefined,
    });
  };

  const handleArchive = () => {
    if (!listing) return;
    archiveMutation.mutate({ listingId: listing.id });
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency ?? "USD",
    }).format(price);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-4 h-10 w-32" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error ?? !listing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card className="mt-8 flex min-h-[400px] items-center justify-center border-dashed">
          <div className="text-center">
            <p className="text-muted-foreground text-lg">
              {error ? "Error loading listing" : "Listing not found"}
            </p>
            <Button className="mt-4" onClick={() => router.push("/buy")}>
              Browse Listings
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const images = listing.mediaAttachments?.filter(
    (m) => m.fileType === MediaFileType.IMAGE
  ) ?? [];
  const videos = listing.mediaAttachments?.filter(
    (m) => m.fileType === MediaFileType.VIDEO
  ) ?? [];
  const documents = listing.mediaAttachments?.filter(
    (m) => m.fileType === MediaFileType.DOCUMENT
  ) ?? [];

  // Check if current user is owner
  const isOwner = user && listing?.userId && user.id === listing.userId;
  
  // Check if listing can be linked (user is logged in, listing is anonymous, user doesn't own it)
  const canLinkListing = user && !listing.userId && !isOwner;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Media Gallery */}
        <div className="space-y-4">
          {images.length > 0 ? (
            <>
              <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
                <Image
                  src={images[0]?.thumbnailUrl ?? images[0]?.storagePath ?? ""}
                  alt={`${listing.manufacturer} ${listing.model}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(1, 5).map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setPreviewIndex(index + 1)}
                      className="relative aspect-square w-full overflow-hidden rounded border transition-opacity hover:opacity-80"
                    >
                      <Image
                        src={image.thumbnailUrl ?? image.storagePath}
                        alt={`${listing.manufacturer} ${listing.model} - Image ${index + 2}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 25vw, 12.5vw"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex aspect-square w-full items-center justify-center rounded-lg border bg-muted">
              <span className="text-muted-foreground">No images available</span>
            </div>
          )}
        </div>

        {/* Listing Info */}
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl font-bold">
                {listing.manufacturer} {listing.model}
              </h1>
              <ListingStatusBadge status={listing.status} />
              {listing.assured && (
                <Badge variant="default" className="bg-green-600">
                  Assured
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-lg">
              {listing.year} • {listing.condition}
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {formatPrice(Number(listing.askingPrice.toString()), listing.currency)}
            </p>
            {listing.assured && listing.assuredAt && (
              <div className="mt-3 text-sm text-muted-foreground">
                <span className="font-medium">Assured on {formatDate(listing.assuredAt)}</span>
                {listing.assuredBy && (
                  <span> by {listing.assuredBy.name}</span>
                )}
              </div>
            )}
            {isOwner && listing.referenceNumber && (
              <div className="mt-4 rounded-lg bg-muted p-3">
                <p className="text-sm font-medium text-muted-foreground">Reference Number</p>
                <p className="mt-1 font-mono text-lg font-bold">{listing.referenceNumber}</p>
              </div>
            )}
          </div>

          {/* Equipment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Equipment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Serial Number:</span>
                <span className="font-medium">{listing.serialNumber}</span>
              </div>
              {listing.hours && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hours:</span>
                  <span className="font-medium">{listing.hours}</span>
                </div>
              )}
              {listing.miles && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Miles:</span>
                  <span className="font-medium">{listing.miles}</span>
                </div>
              )}
              {listing.repossessed && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Repossessed:</span>
                  <span className="font-medium">Yes</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location */}
          {listing.contactInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  {listing.contactInfo.city}, {listing.contactInfo.stateProvince}
                </p>
                <p className="text-muted-foreground text-sm">
                  {listing.contactInfo.country}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Contact Info (if owner or admin) */}
          {isOwner && listing.contactInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-muted-foreground">Name:</span>{" "}
                  {listing.contactInfo.contactName}
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span>{" "}
                  {listing.contactInfo.phone}
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>{" "}
                  {listing.contactInfo.email}
                </div>
                {listing.contactInfo.companyName && (
                  <div>
                    <span className="text-muted-foreground">Company:</span>{" "}
                    {listing.contactInfo.companyName}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Link to Account Button */}
          {canLinkListing && listing.referenceNumber && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                if (listing.referenceNumber) {
                  linkListingMutation.mutate({
                    referenceNumber: listing.referenceNumber,
                  });
                }
              }}
              disabled={linkListingMutation.isPending}
            >
              {linkListingMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Linking...
                </>
              ) : (
                <>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Link to Account
                </>
              )}
            </Button>
          )}

          {/* Owner Actions */}
          {isOwner && (
            <div className="flex flex-col gap-2">
                {(listing.status === ListingStatus.PUBLISHED ||
                  listing.status === ListingStatus.RESERVED) && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="default" className="w-full">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Mark as Sold
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Mark as Sold</AlertDialogTitle>
                        <AlertDialogDescription>
                          Enter the sale details below.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="soldPrice">Sold Price (optional)</Label>
                          <Input
                            id="soldPrice"
                            type="number"
                            value={soldPrice}
                            onChange={(e) => setSoldPrice(e.target.value)}
                            placeholder="Enter sold price"
                          />
                        </div>
                        <div>
                          <Label htmlFor="soldTo">Sold To (optional)</Label>
                          <Input
                            id="soldTo"
                            value={soldTo}
                            onChange={(e) => setSoldTo(e.target.value)}
                            placeholder="Buyer name or company"
                          />
                        </div>
                        <div>
                          <Label htmlFor="soldNotes">Notes (optional)</Label>
                          <Textarea
                            id="soldNotes"
                            value={soldNotes}
                            onChange={(e) => setSoldNotes(e.target.value)}
                            placeholder="Additional notes about the sale"
                          />
                        </div>
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleMarkAsSold}
                          disabled={markAsSoldMutation.isPending}
                        >
                          {markAsSoldMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Confirm
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              {listing.status !== ListingStatus.SOLD &&
                listing.status !== ListingStatus.ARCHIVED && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Archive className="mr-2 h-4 w-4" />
                        Archive Listing
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Archive Listing</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to archive this listing? You can
                          restore it later if needed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleArchive}
                          disabled={archiveMutation.isPending}
                        >
                          {archiveMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Confirm
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
            </div>
          )}
        </div>
      </div>

      {/* Listing Details */}
      {listing.listingDetails && (
        <div className="mt-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {listing.listingDetails.generalDescription && (
                <div>
                  <h3 className="mb-2 font-semibold">General Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {listing.listingDetails.generalDescription}
                  </p>
                </div>
              )}
              {listing.listingDetails.locatingSystems && (
                <div>
                  <h3 className="mb-2 font-semibold">Locating Systems</h3>
                  <p className="text-muted-foreground">
                    {listing.listingDetails.locatingSystems}
                  </p>
                </div>
              )}
              {listing.listingDetails.mixingSystems && (
                <div>
                  <h3 className="mb-2 font-semibold">Mixing Systems</h3>
                  <p className="text-muted-foreground">
                    {listing.listingDetails.mixingSystems}
                  </p>
                </div>
              )}
              {listing.listingDetails.accessories && (
                <div>
                  <h3 className="mb-2 font-semibold">Accessories</h3>
                  <p className="text-muted-foreground">
                    {listing.listingDetails.accessories}
                  </p>
                </div>
              )}
              {listing.listingDetails.trailers && (
                <div>
                  <h3 className="mb-2 font-semibold">Trailers</h3>
                  <p className="text-muted-foreground">
                    {listing.listingDetails.trailers}
                  </p>
                </div>
              )}
              {listing.listingDetails.recentWorkModifications && (
                <div>
                  <h3 className="mb-2 font-semibold">Recent Work/Modifications</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {listing.listingDetails.recentWorkModifications}
                  </p>
                </div>
              )}
              {listing.listingDetails.additionalInformation && (
                <div>
                  <h3 className="mb-2 font-semibold">Additional Information</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {listing.listingDetails.additionalInformation}
                  </p>
                </div>
              )}
              {listing.listingDetails.pipe && (
                <div>
                  <h3 className="mb-2 font-semibold">Pipe</h3>
                  <p className="text-muted-foreground">
                    {listing.listingDetails.pipe}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Media Preview Dialog */}
      {previewIndex !== null && images[previewIndex] && (
        <MediaPreviewDialog
          open={previewIndex !== null}
          onOpenChange={(open) => !open && setPreviewIndex(null)}
          file={{
            preview: images[previewIndex]?.thumbnailUrl ?? images[previewIndex]?.storagePath ?? "",
            name: images[previewIndex]?.fileName ?? "",
            type: "image",
          }}
        />
      )}
    </div>
  );
}

