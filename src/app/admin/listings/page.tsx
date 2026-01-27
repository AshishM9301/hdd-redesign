"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListingStatusBadge } from "@/components/listing-status-badge";
import { ListingStatus } from "@/types/listing";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Loader2, Eye, ShieldCheck, ShieldOff } from "lucide-react";

export default function AdminListingsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("all");
  const [assured, setAssured] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch } = api.admin.getAllListings.useQuery({
    page,
    limit: 20,
    status: status !== "all" ? (status as ListingStatus) : undefined,
    assured:
      assured !== "all" ? assured === "assured" : undefined,
    search: search ?? undefined,
  });

  const assureMutation = api.admin.assureListing.useMutation({
    onSuccess: () => {
      toast.success("Listing assured successfully");
      void refetch();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to assure listing");
    },
  });

  const unassureMutation = api.admin.unassureListing.useMutation({
    onSuccess: () => {
      toast.success("Assurance removed successfully");
      void refetch();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to remove assurance");
    },
  });

  const handleAssure = (listingId: string) => {
    assureMutation.mutate({ listingId });
  };

  const handleUnassure = (listingId: string) => {
    unassureMutation.mutate({ listingId });
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin - Listings Management</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Manage and assure listings
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by reference, manufacturer, model..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select value={status} onValueChange={(value) => {
          setStatus(value);
          setPage(1);
        }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value={ListingStatus.DRAFT}>Draft</SelectItem>
            <SelectItem value={ListingStatus.PENDING_REVIEW}>
              Pending Review
            </SelectItem>
            <SelectItem value={ListingStatus.PUBLISHED}>Published</SelectItem>
            <SelectItem value={ListingStatus.RESERVED}>Reserved</SelectItem>
            <SelectItem value={ListingStatus.SAMPLE}>Sample</SelectItem>
            <SelectItem value={ListingStatus.SOLD}>Sold</SelectItem>
            <SelectItem value={ListingStatus.ARCHIVED}>Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={assured} onValueChange={(value) => {
          setAssured(value);
          setPage(1);
        }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Assured" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Listings</SelectItem>
            <SelectItem value="assured">Assured Only</SelectItem>
            <SelectItem value="not-assured">Not Assured</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !data || data?.listings.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No listings found</p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference #</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assured</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.listings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell className="font-mono text-sm">
                      {(listing?.referenceNumber ?? "N/A")}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {listing.manufacturer} {listing.model}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {listing?.year}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ListingStatusBadge status={listing.status} />
                    </TableCell>
                    <TableCell>
                      {listing.assured ? (
                        <Badge variant="default" className="bg-green-600">
                          Assured
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Not Assured</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(listing.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/listings/${listing.id}`)
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        {listing?.assured ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnassure(listing.id)}
                            disabled={unassureMutation.isPending}
                          >
                            {unassureMutation.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <ShieldOff className="mr-2 h-4 w-4" />
                            )}
                            Unassure
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleAssure(listing.id)}
                            disabled={assureMutation.isPending}
                          >
                            {assureMutation.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <ShieldCheck className="mr-2 h-4 w-4" />
                            )}
                            Assure
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data?.totalPages && data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Showing {data.listings.length} of {data.total} listings
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-muted-foreground flex items-center px-4 text-sm">
                  Page {page} of {data?.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((p) => Math.min(data.totalPages, p + 1))
                  }
                  disabled={page === data.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

