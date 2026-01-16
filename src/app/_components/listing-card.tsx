"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListingStatusBadge } from "@/components/listing-status-badge";
import type { ListingWithRelations } from "@/types/listing";
import { MediaFileType } from "@/types/listing";
import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";

type Props = {
  listing: ListingWithRelations;
};

export function ListingCard({ listing }: Props) {
  const router = useRouter();
  const firstImage = listing.mediaAttachments?.find(
    (m) => m.fileType === MediaFileType.IMAGE
  );

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(price);
  };

  return (
    <Card
      className="relative flex cursor-pointer flex-col overflow-hidden py-0 transition-shadow hover:shadow-lg"
      onClick={() => router.push(`/listings/${listing.id}`)}
    >
      <div className="bg-accent/40 relative aspect-4/3 w-full overflow-hidden">
        {firstImage?.thumbnailUrl || firstImage?.url ? (
          <Image
            src={firstImage.thumbnailUrl || firstImage.url}
            alt={`${listing.manufacturer} ${listing.model}`}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(min-width: 1024px) 250px, (min-width: 768px) 33vw, 100vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-muted-foreground text-sm">No Image</span>
          </div>
        )}
      </div>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="line-clamp-1 text-base">
            {listing.manufacturer} {listing.model}
          </CardTitle>
          <ListingStatusBadge status={listing.status} />
        </div>
        <div className="text-muted-foreground text-xs">
          {listing.year} • {listing.condition}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-3 pb-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">
            {formatPrice(listing.askingPrice, listing.currency)}
          </span>
          {listing.contactInfo && (
            <span className="text-muted-foreground text-xs">
              {listing.contactInfo.city}, {listing.contactInfo.stateProvince}
            </span>
          )}
        </div>
        {listing.mediaAttachments && listing.mediaAttachments.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{listing.mediaAttachments.length} media file(s)</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

