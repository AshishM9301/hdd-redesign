"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UploadStatusBadge } from "@/components/upload-status-badge";
import { TopLoadingBar } from "@/components/top-loading-bar";
import { parseUploadRequestFiles, formatDate } from "@/lib/upload-request";
import { type UploadRequest } from "@/types/upload-request";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const loadingRows = Array.from({ length: 5 }).map((_, idx) => (
  <TableRow key={idx}>
    <TableCell colSpan={7}>
      <Skeleton className="h-12 w-full" />
    </TableCell>
  </TableRow>
));

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle>No upload requests yet</CardTitle>
        <CardDescription>Once you submit uploads, they will appear here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          You can start by submitting files from the listing flow.
        </p>
      </CardContent>
    </Card>
  );
}

function RequestTable({ requests }: { requests: UploadRequest[] }) {
  const router = useRouter();
  const utils = api.useUtils();

  const cancelMutation = api.mediaUpload.cancelUploadRequest.useMutation({
    onSuccess: async () => {
      toast.success("Request cancelled");
      await utils.mediaUpload.getMyUploadRequests.invalidate();
    },
    onError: (error) => toast.error(error.message || "Unable to cancel request"),
  });

  const isBusy = cancelMutation.isPending;

  const handleCancel = (requestId: string) => {
    cancelMutation.mutate({ requestId });
  };

  return (
    <>
      <TopLoadingBar active={isBusy} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Listing Ref</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Files</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => {
              const files = parseUploadRequestFiles(request.mediaFiles);
              return (
                <TableRow key={request.id}>
                  <TableCell className="font-mono text-xs">{request.id.slice(0, 8)}…</TableCell>
                  <TableCell className="text-sm">
                    {request.referenceNumber ?? request.listing?.referenceNumber ?? "—"}
                  </TableCell>
                  <TableCell>
                    <UploadStatusBadge status={request.status} />
                  </TableCell>
                  <TableCell className="text-sm">{files.length}</TableCell>
                  <TableCell className="text-sm">{formatDate(request.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/my-upload-requests/${request.id}`)}
                      >
                        View
                      </Button>
                      {request.status === "PENDING" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" disabled={cancelMutation.isPending}>
                              {cancelMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Cancel"
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel request?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will cancel your upload request. You can submit again later.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleCancel(request.id)}>Confirm</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

export default function MyUploadRequestsClient() {
  const query = api.mediaUpload.getMyUploadRequests.useQuery();

  const requests = useMemo(() => query.data ?? [], [query.data]);

  if (query.isLoading) {
    return (
      <div className="py-8">
        <TopLoadingBar active />
        <div className="mb-6">
          <h1 className="text-3xl font-bold">My Upload Requests</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            View and manage your submitted upload requests.
          </p>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Listing Ref</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Files</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{loadingRows}</TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <TopLoadingBar active={query.isFetching} />
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Upload Requests</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          View and manage your submitted upload requests.
        </p>
      </div>

      {!requests || requests.length === 0 ? <EmptyState /> : <RequestTable requests={requests} />}
    </div>
  );
}

