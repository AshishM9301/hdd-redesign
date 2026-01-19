"use client";

import React from "react";
import { api } from "@/trpc/react";
import { ListingStatusBadge } from "@/components/listing-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ListingStatus } from "@/types/listing";
import { useRouter } from "next/navigation";
import { Loader2, Eye, Archive, CheckCircle2 } from "lucide-react";
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

export default function ListingsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = React.useState<ListingStatus | "all">("all");

  const { data: listings, isLoading, refetch } = api.listing.getByUser.useQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const publishMutation = api.listing.publish.useMutation({
    onSuccess: () => {
      toast.success("Listing published successfully!");
      void refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to publish listing");
    },
  });

  const markAsSoldMutation = api.listing.markAsSold.useMutation({
    onSuccess: () => {
      toast.success("Listing marked as sold!");
      void refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to mark listing as sold");
    },
  });

  const archiveMutation = api.listing.archive.useMutation({
    onSuccess: () => {
      toast.success("Listing archived!");
      void refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to archive listing");
    },
  });

  const handlePublish = (listingId: string) => {
    publishMutation.mutate({ listingId });
  };

  const handleMarkAsSold = (listingId: string) => {
    markAsSoldMutation.mutate({ listingId });
  };

  const handleArchive = (listingId: string) => {
    archiveMutation.mutate({ listingId });
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(price);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Listings</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your equipment listings
          </p>
        </div>
        <Button onClick={() => router.push("/sell/list")}>
          Create New Listing
        </Button>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <label className="text-sm font-medium">Filter by status:</label>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as ListingStatus | "all")}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value={ListingStatus.DRAFT}>Draft</SelectItem>
            <SelectItem value={ListingStatus.PUBLISHED}>Published</SelectItem>
            <SelectItem value={ListingStatus.RESERVED}>Reserved</SelectItem>
            <SelectItem value={ListingStatus.SOLD}>Sold</SelectItem>
            <SelectItem value={ListingStatus.ARCHIVED}>Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !listings || listings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No listings found. Create your first listing to get started!
          </p>
          <Button
            className="mt-4"
            onClick={() => router.push("/sell/list")}
          >
            Create Listing
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reference Number</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {listing.manufacturer} {listing.model}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {listing.year} • {listing.condition}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatPrice(
                      Number(listing.askingPrice.toString()),
                      listing.currency,
                    )}
                  </TableCell>
                  <TableCell>
                    <ListingStatusBadge status={listing.status} />
                  </TableCell>
                  <TableCell>
                    {listing.referenceNumber ? (
                      <span className="font-mono text-sm">
                        {listing.referenceNumber}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(listing.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/listings/${listing.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {listing.status === ListingStatus.DRAFT && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePublish(listing.id)}
                          disabled={publishMutation.isPending}
                        >
                          {publishMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Publish"
                          )}
                        </Button>
                      )}
                      {(listing.status === ListingStatus.PUBLISHED ||
                        listing.status === ListingStatus.RESERVED) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Mark as Sold
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Mark as Sold</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to mark this listing as sold?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleMarkAsSold(listing.id)}
                                disabled={markAsSoldMutation.isPending}
                              >
                                {markAsSoldMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
                              <Button variant="outline" size="sm">
                                <Archive className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Archive Listing</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to archive this listing?
                                  You can restore it later if needed.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleArchive(listing.id)}
                                  disabled={archiveMutation.isPending}
                                >
                                  {archiveMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : null}
                                  Confirm
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}



