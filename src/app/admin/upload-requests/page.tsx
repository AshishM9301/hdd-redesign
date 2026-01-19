"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Loader2, ShieldCheck, ShieldX } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/react";

type UploadStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

type UploadRequestFile = {
  fileName: string;
  storagePath: string;
  fileType: string;
  fileSize?: number;
};

function parseFiles(raw: unknown): UploadRequestFile[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (
        item &&
        typeof item === "object" &&
        "fileName" in item &&
        "storagePath" in item &&
        "fileType" in item
      ) {
        return {
          fileName: String((item as Record<string, unknown>).fileName),
          storagePath: String((item as Record<string, unknown>).storagePath),
          fileType: String((item as Record<string, unknown>).fileType),
          fileSize: "fileSize" in item ? Number((item as Record<string, unknown>).fileSize) : undefined,
        } satisfies UploadRequestFile;
      }
      return null;
    })
    .filter(Boolean) as UploadRequestFile[];
}

const statusBadges: Record<
  UploadStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }
> = {
  PENDING: { label: "Pending", variant: "secondary", className: "bg-amber-100 text-amber-900 border-amber-200" },
  APPROVED: { label: "Approved", variant: "default", className: "bg-emerald-600 text-white" },
  REJECTED: { label: "Rejected", variant: "destructive" },
  CANCELLED: { label: "Cancelled", variant: "outline" },
};

export default function AdminUploadRequestsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch, isFetching } =
    api.admin.getAllUploadRequests.useQuery({
      page,
      limit: 20,
      status: status !== "all" ? (status as UploadStatus) : undefined,
      search: search || undefined,
    });

  const approveMutation = api.admin.approveUploadRequest.useMutation({
    onSuccess: () => {
      toast.success("Request approved");
      void refetch();
    },
    onError: (error) => toast.error(error.message || "Failed to approve"),
  });

  const rejectMutation = api.admin.rejectUploadRequest.useMutation({
    onSuccess: () => {
      toast.success("Request rejected");
      void refetch();
    },
    onError: (error) => toast.error(error.message || "Failed to reject"),
  });

  const handleApprove = (requestId: string) => {
    if (!window.confirm("Approve this upload request?")) return;
    approveMutation.mutate({ requestId });
  };

  const handleReject = (requestId: string) => {
    const reason = window.prompt("Enter rejection reason");
    if (!reason) return;
    rejectMutation.mutate({ requestId, rejectionReason: reason });
  };

  const loadingRows = useMemo(
    () => Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />),
    [],
  );

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin - Upload Requests</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Review and process media upload requests
          </p>
        </div>
        {isFetching && (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Refreshing
          </div>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[220px]">
          <Input
            placeholder="Search by email, contact name, reference #"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-4">{loadingRows}</div>
      ) : !data || data.requests.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No upload requests found</p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Listing Ref</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Files</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.requests.map((request) => {
                  const files = parseFiles((request as any).mediaFiles);
                  const badge = statusBadges[request.status as UploadStatus];
                  return (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono text-xs">
                        {request.id.slice(0, 8)}…
                      </TableCell>
                      <TableCell className="max-w-[220px]">
                        <div className="font-medium">{request.contactName}</div>
                        <div className="text-muted-foreground text-xs">
                          {request.phone || "—"}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{request.email}</TableCell>
                      <TableCell className="text-sm">
                        {request.referenceNumber ||
                          request.listing?.referenceNumber ||
                          "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={badge.variant} className={badge.className}>
                          {badge.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {files.length}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(request.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/upload-requests/${request.id}`)
                            }
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          {request.status === "PENDING" && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleApprove(request.id)}
                                disabled={approveMutation.isPending}
                              >
                                {approveMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <ShieldCheck className="h-4 w-4" />
                                )}
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReject(request.id)}
                                disabled={rejectMutation.isPending}
                              >
                                {rejectMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <ShieldX className="h-4 w-4" />
                                )}
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Showing {data.requests.length} of {data.total} requests
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
                  Page {page} of {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
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

