"use client";

import React from "react";
import Link from "next/link";
import {
  Upload,
  List,
  ArrowLeft,
  Mail,
  Phone,
  ExternalLink,
  Image as ImageIcon,
  FileText,
  DollarSign,
  Key,
  ArrowRightLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export function HelpfulLinks() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Card className="border-2 shadow-lg bg-gradient-to-br from-blue-200/60 via-blue-100/20 to-blue-100/5">
      <div className="h-full backdrop-blur-sm">

      <CardHeader className=" pb-3">
        <CardTitle className="text-foreground flex items-center gap-2 text-lg font-semibold">
          <ExternalLink className="size-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Primary Actions */}
        <div className="space-y-2">
          <Button
            asChild
            className="w-full justify-start gap-3 bg-yellow-700 hover:bg-yellow-800 transition-all duration-300"
            size="lg"
          >
            <Link href="/sell/list">
              <Upload className="size-5" />
              <span>Start Listing</span>
            </Link>
          </Button>

          {!isLoading && isAuthenticated && (
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
          )}

          <Button
            asChild
            variant="outline"
            className="w-full justify-start gap-3"
            size="lg"
          >
            <Link href="/sell">
              <ImageIcon className="size-5" />
              <span>Add Images to Listing</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full justify-start gap-3"
            size="lg"
          >
            <Link href="/listings/access">
              <Key className="size-5" />
              <span>Access Your Listing</span>
            </Link>
          </Button>
        </div>

        {/* Divider */}
        <div className="my-4 h-px bg-border" />

        {/* Resources Section */}
        <div className="space-y-2">
          <p className="text-stone-50/90 mb-2 text-sm font-medium ">
            Resources
          </p>
          <Button
            asChild
            variant="ghost"
            className="w-full justify-start gap-3 text-sm hover:bg-yellow-400"
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
            className="w-full justify-start gap-3 text-sm hover:bg-yellow-400"
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
            className="w-full justify-start gap-3 text-sm hover:bg-yellow-400"
            size="sm"
          >
            <Link href="/sell/trade-in">
              <ArrowRightLeft className="size-4" />
              <span>Trade In Equipment</span>
            </Link>
          </Button>
        </div>

        {/* Divider */}
        <div className="my-4 h-px bg-border" />

        {/* Support Section */}
        <div className="space-y-2">
          <p className="text-stone-50/90 mb-2 text-sm font-medium ">
            Need More Help?
          </p>
          <Button
            asChild
            variant="ghost"
            className="w-full justify-start gap-3 text-sm hover:bg-yellow-400 transition-all duration-300 "
            size="sm"
          >
            <a href="mailto:listings@hddbroker.com">
              <Mail className="size-4" />
              <span>Email Support</span>
            </a>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="w-full justify-start gap-3 text-sm hover:bg-yellow-400 transition-all duration-300"
            size="sm"
          >
            <a href="tel:+12392562344">
              <Phone className="size-4" />
              <span>Call Us</span>
            </a>
          </Button>
        </div>
      </CardContent>
      </div>

    </Card>
  );
}

