"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ListingDetailView } from "@/components/listing-detail-view";
import { sampleListing } from "@/components/data/sample-listing";

export default function SampleListingPage() {
  const router = useRouter();

  const handleRequestInfo = () => {
    router.push("/sell/listing-sample/request-info");
  };

  const loginRequired = () => {
    toast.error("Login required");
  };

  const handleViewDocument = () => {
    toast.message("Sample document (no view)");
  };

  const handleDownloadDocument = () => {
    toast.message("Sample document (no download)");
  };

  return (
    <ListingDetailView
      listing={sampleListing}
      isSampleMode={true}
      backUrl="/sell"
      onBack={() => router.push("/sell")}
      onRequestInfo={handleRequestInfo}
      onMakeOffer={loginRequired}
      onWatch={loginRequired}
      onNotify={loginRequired}
      onViewDocument={handleViewDocument}
      onDownloadDocument={handleDownloadDocument}
    />
  );
}
