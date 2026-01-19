"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  UploadStatusBadge,
  type UploadStatus,
} from "@/components/upload-status-badge";
import { TopLoadingBar } from "@/components/top-loading-bar";
import { fileSizeLabel, formatDateTime, parseUploadRequestFiles } from "@/lib/upload-request";
import { api } from "@/trpc/react";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  requestId: string;
};

export default function UploadRequestDetailClient({ requestId }: Props) {
  const router = useRouter();

  const query = api.mediaUpload.getUploadRequest.useQuery(
    { requestId },
    { enabled: Boolean(requestId) },
  );

  const cancelMutation = api.mediaUpload.cancelUploadRequest.useMutation({
    onSuccess: async () => {
      toast.success("Request cancelled");
      await query.refetch();
      router.refresh();
    },
    onError: (error) => toast.error(error.message || "Unable to cancel request"),
  });

  const data = query.data;
  const files = parseUploadRequestFiles(data?.mediaFiles);
  const isBusy = query.isFetching || cancelMutation.isPending;

  if (!requestId) {
    return (
      <div className="py-8">
        <p className="text-muted-foreground">Invalid request id.</p>
      </div>
    );
  }

  if (query.isLoading) {
    return (
      <div className="py-8">
        <TopLoadingBar active />
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => router.push("/my-upload-requests")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Skeleton className="h-10 w-64" />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (query.error) {
    return (
      <div className="py-8">
        <TopLoadingBar active={false} />
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => router.push("/my-upload-requests")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <p className="text-destructive">{query.error.message}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="py-8">
      <TopLoadingBar active={isBusy} />
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => router.push("/my-upload-requests")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Upload Request</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Review your request details and attached files.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <UploadStatusBadge status={data.status as UploadStatus} />
            <span className="text-muted-foreground">ID: {data.id}</span>
          </div>
        </div>

        {data.status === "PENDING" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={cancelMutation.isPending}>
                {cancelMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Cancel request"
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel this request?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will cancel your request. You can submit a new one later.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep</AlertDialogCancel>
                <AlertDialogAction onClick={() => cancelMutation.mutate({ requestId })}>
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

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
                <p className="font-medium">{data.phone ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Reference #</p>
                <p className="font-medium">
                  {data.referenceNumber ?? data.listing?.referenceNumber ?? "—"}
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
                    Ref: {data.listing.referenceNumber ?? "—"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/listings/${data.listing?.id}`)}
                >
                  View listing
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground mt-2 text-sm">No listing matched yet.</p>
            )}
          </div>

          <div className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold">Message</h2>
            <p className="text-muted-foreground mt-2 whitespace-pre-wrap text-sm">
              {data.message ?? "No message provided."}
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
                  <div key={file.storagePath} className="rounded-md border p-3">
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
                          rel="noreferrer"
                          target="_blank"
                        >
                          Download
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold">Status</h2>
            <div className="mt-3 space-y-1 text-sm">
              <UploadStatusBadge status={data.status as UploadStatus} />
              <p className="text-muted-foreground">Updated: {formatDateTime(data.updatedAt ?? data.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

