"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Link as LinkIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LinkListingPage() {
  const router = useRouter();
  const [referenceNumber, setReferenceNumber] = React.useState("");

  const linkMutation = api.listing.linkListingToAccount.useMutation({
    onSuccess: () => {
      toast.success("Listing successfully linked to your account!");
      router.push("/sell/listings");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to link listing to account");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!referenceNumber.trim()) {
      toast.error("Please enter a reference number");
      return;
    }
    linkMutation.mutate({ referenceNumber: referenceNumber.trim() });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/sell/listings">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Listings
        </Button>
      </Link>

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Link Listing to Account
            </CardTitle>
            <CardDescription>
              Enter the reference number from your listing to link it to your account. This will allow you to manage the listing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="referenceNumber">Reference Number</Label>
                <Input
                  id="referenceNumber"
                  type="text"
                  placeholder="REF-20250116123456-A7B9"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  disabled={linkMutation.isPending}
                  className="font-mono"
                />
                <p className="text-muted-foreground text-sm">
                  You can find your reference number in the confirmation message or email you received when you created the listing.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={linkMutation.isPending || !referenceNumber.trim()}
              >
                {linkMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Linking...
                  </>
                ) : (
                  <>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Link Listing
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

