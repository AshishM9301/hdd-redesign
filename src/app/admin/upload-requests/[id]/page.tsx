"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, Eye, Loader2, ShieldCheck, ShieldX } from "lucide-react";
import { toast } from "sonner";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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

export default function AdminUploadRequestDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const requestId = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  if (!requestId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Invalid request id.</p>
      </div>
    );
  }

  const [approveNotes, setApproveNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const query = api.admin.getUploadRequestDetails.useQuery(
    { requestId: requestId ?? "" },
    { enabled: Boolean(requestId) },
  );

  const approveMutation = api.admin.approveUploadRequest.useMutation({
    onSuccess: () => {
      toast.success("Request approved");
      void query.refetch();
    },
    onError: (error) => toast.error(error.message || "Failed to approve"),
  });

  const rejectMutation = api.admin.rejectUploadRequest.useMutation({
    onSuccess: () => {
      toast.success("Request rejected");
      setRejectionReason("");
      void query.refetch();
    },
    onError: (error) => toast.error(error.message || "Failed to reject"),
  });

  const data = query.data;
  const files = useMemo(() => parseFiles(data?.mediaFiles), [data?.mediaFiles]);

  const formatDateTime = (value: Date | string) =>
    new Date(value).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const fileSizeLabel = (size?: number) => {
    if (!size) return "—";
    const kb = size / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const renderStatusBadge = (status: UploadStatus) => {
    const badge = statusBadges[status];
    return (
      <Badge variant={badge.variant} className={badge.className}>
        {badge.label}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Upload Request</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Review request details and attached files
          </p>
          {data && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              {renderStatusBadge(data.status as UploadStatus)}
              <span className="text-muted-foreground">ID: {data.id}</span>
            </div>
          )}
        </div>

        {data?.status === "PENDING" && (
          <div className="flex flex-wrap gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="default" size="sm" disabled={approveMutation.isPending}>
                  {approveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                  Approve
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Approve request</AlertDialogTitle>
                  <AlertDialogDescription>
                    Optionally add notes for the requester.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Textarea
                  value={approveNotes}
                  onChange={(e) => setApproveNotes(e.target.value)}
                  placeholder="Notes (optional)"
                />
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      approveMutation.mutate({ requestId, notes: approveNotes || undefined })
                    }
                  >
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={rejectMutation.isPending}>
                  {rejectMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldX className="h-4 w-4" />
                  )}
                  Reject
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reject request</AlertDialogTitle>
                  <AlertDialogDescription>
                    Provide a rejection reason to send to the requester.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Rejection reason"
                />
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      rejectMutation.mutate({
                        requestId,
                        rejectionReason: rejectionReason || "Request rejected",
                      })
                    }
                  >
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {query.isLoading || !data ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-lg border p-4">
              <h2 className="text-lg font-semibold">Contact</h2>
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{data.contactName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium break-all">{data.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{data.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reference #</p>
                  <p className="font-medium">
                    {data.referenceNumber || data.listing?.referenceNumber || "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h2 className="text-lg font-semibold">Listing</h2>
              {data.listing ? (
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  <div className="space-y-1">
                    <p className="font-medium">
                      {data.listing.manufacturer} {data.listing.model}
                    </p>
                    <p className="text-muted-foreground">
                      Ref: {data.listing.referenceNumber || "—"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/listings/${data.listing?.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                    View Listing
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground mt-2 text-sm">
                  No listing automatically matched.
                </p>
              )}
            </div>

            <div className="rounded-lg border p-4">
              <h2 className="text-lg font-semibold">Message</h2>
              <p className="text-muted-foreground mt-2 whitespace-pre-wrap text-sm">
                {data.message || "No message provided."}
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Files ({files.length})</h2>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {files.map((file) => {
                  const isImage = file.fileType.startsWith("image/");
                  return (
                    <div
                      key={file.storagePath}
                      className="rounded-md border p-3"
                    >
                      <p className="font-medium text-sm">{file.fileName}</p>
                      <p className="text-muted-foreground text-xs">
                        {file.fileType} · {fileSizeLabel(file.fileSize)}
                      </p>
                      {isImage ? (
                        <div className="mt-3 overflow-hidden rounded-md border bg-muted/30">
                          <Image
                            src={file.storagePath}
                            alt={file.fileName}
                            width={400}
                            height={300}
                            className="h-48 w-full object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="mt-3 flex items-center gap-2">
                          <Download className="h-4 w-4 text-muted-foreground" />
                          <a
                            className="text-primary text-sm font-medium underline-offset-4 hover:underline"
                            href={file.storagePath}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Download / Open
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
                {files.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    No files found on this request.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h2 className="text-lg font-semibold">Status</h2>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current</span>
                  {renderStatusBadge(data.status as UploadStatus)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{formatDateTime(data.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Updated</span>
                  <span className="font-medium">
                    {data.updatedAt ? formatDateTime(data.updatedAt) : "—"}
                  </span>
                </div>
                {data.reviewedBy && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Reviewed by</span>
                    <span className="font-medium">{data.reviewedBy.name || data.reviewedBy.email}</span>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-muted-foreground text-xs">Status history</p>
                <div className="mt-2 space-y-2">
                  {data.statusHistory.map((item: any) => (
                    <div key={item.at.toString()} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.status}</span>
                      <span className="text-muted-foreground">
                        {formatDateTime(item.at)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {data.user && (
              <div className="rounded-lg border p-4">
                <h2 className="text-lg font-semibold">User</h2>
                <div className="mt-2 space-y-1 text-sm">
                  <p className="font-medium">{data.user.name || "User"}</p>
                  <p className="text-muted-foreground">{data.user.email}</p>
                  <p className="text-muted-foreground text-xs">Authenticated submitter</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

