"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { MediaFileType } from "@/types/listing";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MakeOfferForm } from "./_components/make-offer-form";

export default function MakeOfferPage() {
  const params = useParams();
  const router = useRouter();
  const identifier = params.id as string;

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

  // Handle back navigation
  const handleBack = () => {
    if (apiListing) {
      const backUrl = isReferenceNumber
        ? `/listings/${apiListing.referenceNumber}`
        : `/listings/${apiListing.id}`;
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 md:px-6 md:py-10">
        <Skeleton className="mb-6 h-10 w-32" />
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <div className="space-y-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error ?? !apiListing) {
    return (
      <div className="container mx-auto px-4 py-6 md:px-6 md:py-10">
        <Button variant="ghost" className="mb-6 gap-2" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
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

  // Get images for the listing
  const images = apiListing.mediaAttachments?.filter(
    (m) => m.fileType === MediaFileType.IMAGE,
  ) ?? [];

  // Prepare listing data for the form
  const listingData = {
    referenceNumber: apiListing.referenceNumber,
    manufacturer: apiListing.manufacturer,
    model: apiListing.model,
    year: apiListing.year,
    askingPrice: Number(apiListing.askingPrice) || 0,
    currency: apiListing.currency,
    condition: apiListing.condition,
    hours: apiListing.hours,
    city: apiListing.contactInfo?.city ?? null,
    stateProvince: apiListing.contactInfo?.stateProvince ?? null,
    country: apiListing.contactInfo?.country ?? null,
    sellerName: apiListing.contactInfo?.contactName ?? null,
    sellerEmail: apiListing.contactInfo?.email ?? null,
    images: images.map((img) => ({
      id: img.id,
      thumbnailUrl: img.thumbnailUrl ?? img.storagePath,
    })),
  };

  const listingId = apiListing.id;

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-10">
      <Button variant="ghost" className="mb-6 gap-2" onClick={handleBack}>
        <ArrowLeft className="h-4 w-4" />
        Back to Listing
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Make an Offer
        </h1>
        <p className="text-muted-foreground">
          Submit your offer for {apiListing.manufacturer} {apiListing.model} ({apiListing.year})
        </p>
      </div>

      <MakeOfferForm listingId={listingId} listingData={listingData} />
    </div>
  );
}

