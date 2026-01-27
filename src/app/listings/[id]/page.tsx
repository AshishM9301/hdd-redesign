"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { ListingStatus, MediaFileType } from "@/types/listing";
import { useAuth } from "@/hooks/use-auth";
import { ListingDetailView, type ListingDetailData, type SampleDocument } from "@/components/listing-detail-view";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Archive, Link as LinkIcon } from "lucide-react";
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

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const identifier = params.id as string;
  const { user } = useAuth();

  const isReferenceNumber = identifier.startsWith("REF-");

  const getByIdQuery = api.listing.getById.useQuery(
    { listingId: identifier },
    { enabled: !isReferenceNumber },
  );

  const getByReferenceQuery = api.listing.getByReference.useQuery(
    { referenceNumber: identifier },
    { enabled: isReferenceNumber },
  );

  const listingQuery = isReferenceNumber ? getByReferenceQuery : getByIdQuery;
  const { data: apiListing, isLoading, error } = listingQuery;

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

  const handleMarkAsSold = () => {
    if (!apiListing) return;
    markAsSoldMutation.mutate({
      listingId: apiListing.id,
      soldPrice: soldPrice ?? undefined,
      soldTo: soldTo ?? undefined,
      soldNotes: soldNotes ?? undefined,
    });
  };

  const handleArchive = () => {
    if (!apiListing) return;
    archiveMutation.mutate({ listingId: apiListing.id });
  };

  const handleRequestInfo = () => {
    router.push(`/listings/${identifier}/request-info`);
  };

  const handleLinkListing = () => {
    if (apiListing?.referenceNumber) {
      linkListingMutation.mutate({
        referenceNumber: apiListing.referenceNumber,
      });
    }
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

  if (error ?? !apiListing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()}>
          Back
        </Button>
        <div className="mt-8 flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">
              {error ? "Error loading listing" : "Listing not found"}
            </p>
            <Button className="mt-4" onClick={() => router.push("/buy")}>
              Browse Listings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const images = apiListing.mediaAttachments?.filter(
    (m) => m.fileType === MediaFileType.IMAGE
  ) ?? [];
  const videos = apiListing.mediaAttachments?.filter(
    (m) => m.fileType === MediaFileType.VIDEO
  ) ?? [];
  const documents = apiListing.mediaAttachments?.filter(
    (m) => m.fileType === MediaFileType.DOCUMENT
  ) ?? [];

  const isOwner = user && apiListing?.userId && user.id === apiListing.userId;
  const canLinkListing = user && !apiListing.userId && !isOwner;

  const listingData: ListingDetailData = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    referenceNumber: apiListing.referenceNumber,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    manufacturer: apiListing.manufacturer,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    model: apiListing.model,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    year: apiListing.year,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    condition: apiListing.condition,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    hours: apiListing.hours,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    serialNumber: apiListing.serialNumber,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    askingPrice: apiListing.askingPrice,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    currency: apiListing.currency,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    status: apiListing.status,
    city: apiListing.contactInfo?.city ?? null,
    stateProvince: apiListing.contactInfo?.stateProvince ?? null,
    country: apiListing.contactInfo?.country ?? null,
    contactName: apiListing.contactInfo?.contactName ?? null,
    phone: apiListing.contactInfo?.phone ?? null,
    email: apiListing.contactInfo?.email ?? null,
    companyName: apiListing.contactInfo?.companyName ?? null,
    generalDescription: apiListing.listingDetails?.generalDescription ?? null,
    locatingSystems: apiListing.listingDetails?.locatingSystems ?? null,
    mixingSystems: apiListing.listingDetails?.mixingSystems ?? null,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    accessories: apiListing.listingDetails?.accessories ?? null,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    trailers: apiListing.listingDetails?.trailers ?? null,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    recentWorkModifications: apiListing.listingDetails?.recentWorkModifications ?? null,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    additionalInformation: apiListing.listingDetails?.additionalInformation ?? null,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    pipe: apiListing.listingDetails?.pipe ?? null,
    images: images.map((img) => ({
      id: img.id,
      fileName: img.fileName,
      storagePath: img.storagePath,
      thumbnailUrl: img.thumbnailUrl ?? img.storagePath,
    })),
    videos: videos.map((vid) => ({
      id: vid.id,
      fileName: vid.fileName,
      storagePath: vid.storagePath,
      thumbnailUrl: vid.thumbnailUrl ?? vid.storagePath,
    })),
    documents: documents.map((doc) => ({
      id: doc.id,
      name: doc.fileName,
      sizeLabel: "N/A",
      url: doc.storagePath,
    })) satisfies SampleDocument[],
  };

  const OwnerActions = () => (
    <>
      {(apiListing.status === ListingStatus.PUBLISHED ||
        apiListing.status === ListingStatus.RESERVED) && (
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
      {apiListing.status !== ListingStatus.SOLD &&
        apiListing.status !== ListingStatus.ARCHIVED && (
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
                  Are you sure you want to archive this listing? You can restore it later if
                  needed.
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
    </>
  );

  const renderCustomActions = () => {
    if (isOwner) {
      return <OwnerActions />;
    }

    if (canLinkListing) {
      return (
        <Button
          variant="outline"
          className="w-full"
          onClick={handleLinkListing}
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
      );
    }

    return undefined;
  };

  return (
    <ListingDetailView
      listing={listingData}
      isSampleMode={false}
      onBack={() => router.back()}
      onRequestInfo={handleRequestInfo}
      customActions={renderCustomActions()}
    />
  );
}
