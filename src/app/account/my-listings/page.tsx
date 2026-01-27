"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Plus,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Archive,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type StatusFilter = "all" | "active" | "pending" | "sold" | "draft";

const statusConfig = {
  all: { label: "All", color: "default" },
  active: { label: "Active", color: "default" },
  pending: { label: "Pending Review", color: "secondary" },
  sold: { label: "Sold", color: "outline" },
  draft: { label: "Draft", color: "secondary" },
};

export default function MyListingsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const {
    data,
    isLoading,
    refetch,
  } = api.account.getMyListings.useQuery({
    page,
    pageSize: 12,
    status: statusFilter,
  });

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as StatusFilter);
    setPage(1);
  };

  interface ListingItem {
    id: string;
    status: string;
    availabilityStatus: string;
    manufacturer: string;
    model: string;
    year: string;
    askingPrice: { toString(): string };
    currency: string;
    mediaAttachments: Array<{ thumbnailUrl?: string | null }>;
    _count: {
      offers: number;
      connectionRequests: number;
    };
  }

  const getStatusBadge = (listing: ListingItem) => {
    if (listing.status === "PUBLISHED" && listing.availabilityStatus === "AVAILABLE") {
      return <Badge className="bg-green-600">Active</Badge>;
    }
    if (listing.status === "SOLD") {
      return <Badge variant="outline">Sold</Badge>;
    }
    if (listing.status === "PENDING_REVIEW") {
      return <Badge variant="secondary">Pending</Badge>;
    }
    if (listing.status === "DRAFT") {
      return <Badge variant="secondary">Draft</Badge>;
    }
    return <Badge variant="secondary">{listing.status}</Badge>;
  };

  if (isLoading) {
    return <ListingsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Listings</h1>
          <p className="text-muted-foreground">
            {data?.total ?? 0} listing{data?.total !== 1 ? "s" : ""} total
          </p>
        </div>

        <Link href="/sell/list">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Listing
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Listings</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending Review</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Listings Grid */}
      {(!data || data.listings.length === 0) ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No listings yet</h3>
            <p className="mb-4 text-center text-muted-foreground">
              Start by creating your first equipment listing
            </p>
            <Link href="/sell/list">
              <Button>Create Listing</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden">
                <div className="aspect-video w-full overflow-hidden bg-muted relative">
                  {listing.mediaAttachments[0]?.thumbnailUrl ? (
                    <img
                      src={listing.mediaAttachments[0].thumbnailUrl}
                      alt={`${listing.manufacturer} ${listing.model}`}
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(listing)}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="mb-2">
                    <Badge variant="secondary" className="mb-2">
                      {listing.year}
                    </Badge>
                    <h3 className="font-semibold line-clamp-1">
                      {listing.manufacturer} {listing.model}
                    </h3>
                    <p className="text-lg font-bold text-primary">
                      {listing.currency} {Number(listing.askingPrice).toLocaleString()}
                    </p>
                  </div>

                  <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{listing._count.offers} offers</span>
                    <span>•</span>
                    <span>{listing._count.connectionRequests} inquiries</span>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/listings/${listing.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/sell/listings/${listing.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Listing
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Public Page
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {listing.status === "PUBLISHED" && (
                          <DropdownMenuItem>
                            <Archive className="mr-2 h-4 w-4" />
                            Archive Listing
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Listing
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ListingsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Listings</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 w-9" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

