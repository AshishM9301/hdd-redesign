"use client";

import { Badge } from "@/components/ui/badge";
import type { ListingStatus } from "@/types/listing";

type ListingStatusBadgeProps = {
  status: ListingStatus;
  className?: string;
};

const statusConfig: Record<
  ListingStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  PENDING_REVIEW: { label: "Pending Review", variant: "outline" },
  PUBLISHED: { label: "Published", variant: "default" },
  RESERVED: { label: "Reserved", variant: "outline" },
  SOLD: { label: "Sold", variant: "destructive" },
  ARCHIVED: { label: "Archived", variant: "secondary" },
};

export function ListingStatusBadge({
  status,
  className,
}: ListingStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}




