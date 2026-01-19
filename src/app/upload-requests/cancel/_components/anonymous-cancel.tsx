"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TopLoadingBar } from "@/components/top-loading-bar";
import { api } from "@/trpc/react";

type Props = {
  initialToken?: string;
};

export default function AnonymousCancelClient({ initialToken = "" }: Props) {
  const [token, setToken] = useState(initialToken);

  const mutation = api.mediaUpload.cancelUploadRequest.useMutation({
    onSuccess: () => {
      toast.success("Upload request cancelled");
    },
    onError: (error) => toast.error(error.message ?? "Unable to cancel request"),
  });

  const isBusy = mutation.isPending;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token.trim()) {
      toast.error("Please enter a cancellation token");
      return;
    }
    mutation.mutate({ cancellationToken: token.trim() });
  };

  const resultState = useMemo(() => {
    if (mutation.isSuccess) {
      return "success";
    }
    if (mutation.error) {
      return "error";
    }
    return "idle";
  }, [mutation.isSuccess, mutation.error]);

  return (
    <div className="py-10">
      <TopLoadingBar active={isBusy} />
      <div className="mx-auto max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Cancel Upload Request</CardTitle>
            <CardDescription>
              Enter the cancellation token from your email to cancel the upload request.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="token">Cancellation token</Label>
                <Input
                  id="token"
                  name="token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste your token"
                  required
                />
              </div>
              <Button type="submit" disabled={isBusy} className="w-full">
                {isBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Confirm cancellation
              </Button>
            </form>

            {resultState === "success" && (
              <div className="mt-4 flex items-start gap-2 rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">
                <CheckCircle2 className="mt-0.5 h-4 w-4" />
                <div>
                  <p className="font-medium">Request cancelled</p>
                  <p className="text-emerald-700">The upload request is now marked as cancelled.</p>
                </div>
              </div>
            )}

            {resultState === "error" && (
              <div className="mt-4 flex items-start gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-900">
                <AlertCircle className="mt-0.5 h-4 w-4" />
                <div>
                  <p className="font-medium">Could not cancel</p>
                  <p className="text-amber-800">
                    The token may be invalid or expired. Please double-check and try again.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

