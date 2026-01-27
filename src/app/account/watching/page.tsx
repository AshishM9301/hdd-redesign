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
  Eye,
  Filter,
  Heart,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type SortBy = "addedAt" | "price" | "name";
type SortOrder = "asc" | "desc";

export default function WatchingPage() {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortBy>("addedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const { user, isAuthenticated, signOut } = useAuth();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = api.account.getWatchedListings.useQuery({
    page,
    pageSize: 12,
    sortBy,
    sortOrder,
  }, {
    retry: 0,
    refetchOnWindowFocus: false,
    enabled: isAuthenticated,
  });

  const removeFromWatchlist = api.account.removeFromWatchlist.useMutation({
    onSuccess: () => {
      toast.success("Removed from watchlist");
      void refetch();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to remove from watchlist");
    },
  });

  const handleSortChange = (value: string) => {
    const [by, order] = value.split("-") as [SortBy, SortOrder];
    setSortBy(by);
    setSortOrder(order);
    setPage(1);
  };

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Watched Listings</h1>
          <p className="text-muted-foreground">
            Please log in to view your watched listings
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <WatchingSkeleton />;
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Watched Listings</h1>
          <p className="text-muted-foreground">
            Unable to load watched listings
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Eye className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Error loading data</h3>
            <p className="mb-4 text-center text-muted-foreground">
              {error?.message || "Please try again later"}
            </p>
            <Button onClick={() => void refetch()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data || data.listings.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Watched Listings</h1>
          <p className="text-muted-foreground">
            Listings you&apos;re keeping an eye on
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Eye className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No watched listings yet</h3>
            <p className="mb-4 text-center text-muted-foreground">
              Start browsing and save listings you&apos;re interested in
            </p>
            <Link href="/buy">
              <Button>Browse Listings</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Watched Listings</h1>
          <p className="text-muted-foreground">
            {data.total} listing{data.total !== 1 ? "s" : ""} saved
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={`${sortBy}-${sortOrder}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="addedAt-desc">Recently added</SelectItem>
              <SelectItem value="addedAt-asc">Oldest first</SelectItem>
              <SelectItem value="price-asc">Price: Low to high</SelectItem>
              <SelectItem value="price-desc">Price: High to low</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
              <SelectItem value="name-desc">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.listings.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="aspect-video w-full overflow-hidden bg-muted">
              {item.listing.mediaAttachments[0]?.thumbnailUrl ? (
                <img
                  src={item.listing.mediaAttachments[0].thumbnailUrl}
                  alt={`${item.listing.manufacturer} ${item.listing.model}`}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Eye className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <div className="mb-2">
                <Badge variant="secondary" className="mb-2">
                  {item.listing.year}
                </Badge>
                <h3 className="font-semibold line-clamp-1">
                  {item.listing.manufacturer} {item.listing.model}
                </h3>
                <p className="text-lg font-bold text-primary">
                  {item.listing.currency} {item.listing.askingPrice.toLocaleString()}
                </p>
              </div>

              <div className="flex gap-2">
                <Link href={`/listings/${item.listingId}`} className="flex-1">
                  <Button variant="outline" className="w-full" size="sm">
                    View Details
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFromWatchlist.mutate({ listingId: item.listingId })}
                  disabled={removeFromWatchlist.isPending}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
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
    </div>
  );
}

function WatchingSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Watched Listings</h1>
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
