"use client";

import React from "react";
import { Check, CheckCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { guideSteps } from "./guide-data";
import { Upload, List, FileText, DollarSign, ArrowRightLeft } from "lucide-react";
import Link from "next/link";

interface GuideSidebarProps {
  className?: string;
}

export function GuideSidebar({ className }: GuideSidebarProps) {
  return (
    <div className="sticky top-4 space-y-6">
      {/* Start Listing CTA */}
      <Card className="border-2 shadow-lg gap-4">
        <CardHeader className="">
          <CardTitle className="text-foreground flex items-center gap-2 text-lg font-semibold">
            <Upload className="size-5 text-primary" />
            Ready to List?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full justify-start gap-3" size="lg">
            <Link href="/sell/list">
              <Upload className="size-5" />
              <span>Start Your Listing</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full justify-start gap-3"
            size="lg"
          >
            <Link href="/sell/listings">
              <List className="size-5" />
              <span>View My Listings</span>
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="gap-4">
        <CardHeader className="">
          <CardTitle className="text-foreground flex items-center gap-2 text-lg font-semibold">
            <FileText className="size-5 text-primary" />
            Quick Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="  w-6 flex items-center justify-center size-5 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <Check className="size-3" />
              </div>
              <p className="text-sm text-muted-foreground">
                Be honest about equipment condition
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="  w-5 flex items-center justify-center size-5 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <Check className="size-3" />
              </div>
              <p className="text-sm text-muted-foreground">
                Upload 10+ quality photos
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="  w-6 flex items-center justify-center size-5 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <Check className="size-3" />
              </div>
              <p className="text-sm text-muted-foreground">
                Price competitively for faster sales
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="  w-5 flex items-center justify-center size-5 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <svg
                  className="size-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">
                Respond to inquiries quickly
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Related Resources */}
      <Card className="gap-4">
        <CardHeader className="">
          <CardTitle className="text-foreground flex items-center gap-2 text-lg font-semibold">
            <DollarSign className="size-5 text-primary" />
            Related Resources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            asChild
            variant="ghost"
            className="w-full justify-start gap-3 text-sm"
            size="sm"
          >
            <Link href="/sell/sample-listing">
              <FileText className="size-4" />
              <span>Sample Listing</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="w-full justify-start gap-3 text-sm"
            size="sm"
          >
            <Link href="/sell/value-equipment">
              <DollarSign className="size-4" />
              <span>Value Your Equipment</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="w-full justify-start gap-3 text-sm"
            size="sm"
          >
            <Link href="/sell/trade-in">
              <ArrowRightLeft className="size-4" />
              <span>Trade In Equipment</span>
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Need Help */}
      <Card className="from-white/10 via-white/20  to-white/50 bg-gradient-to-br gap-4">
        <CardHeader className="">
          <CardTitle className="text-foreground flex items-center gap-2 text-lg font-semibold">
            <span className=" rounded bg-white p-3 py-1.5 text-primary text-base">?</span>
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-stone-200">
            Our team is here to assist you with your listing.
          </p>
          <div className="space-y-1">
            <p className="text-sm font-medium">Email: listings@hddbroker.com</p>
            <p className="text-sm font-medium">Phone: (239) 256-2344</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

