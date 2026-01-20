"use client";

import React from "react";
import Link from "next/link";
import {
  Upload,
  FileText,
  HelpCircle,
  FileImage,
  ArrowRightLeft,
  DollarSign,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import UploadPhotosDialog from "./upload-photos-dialog";
import { Button } from "@/components/ui/button";

const listingItems = [
  {
    id: 1,
    title: "LIST ONLINE",
    icon: Upload,
    href: "/sell/list",
    gradient: "from-blue-500/20 to-blue-600/20",
  },
  {
    id: 2,
    title: "UPLOAD PHOTOS & DOCUMENTS",
    icon: FileImage,
    href: "#",
    gradient: "from-green-500/20 to-green-600/20",
  },
  { 
    id: 3,
    title: "VIEW FAQ",
    icon: HelpCircle,
    href: "/sell/faq",
    gradient: "from-purple-500/20 to-purple-600/20",
  },
  {
    id: 4,
    title: "SAMPLE LISTING",
    icon: FileText,
    href: "/sell/listing-sample",
    gradient: "from-orange-500/20 to-orange-600/20",
  },
  {
    id: 5,
    title: "TRADE IN EQUIPMENT",
    icon: ArrowRightLeft,
    href: "#",
    gradient: "from-red-500/20 to-red-600/20",
  },
  {
    id: 6,
    title: "VALUE MY EQUIPMENT",
    icon: DollarSign,
    href: "#",
    gradient: "from-yellow-500/20 to-yellow-600/20",
  },
];

export default function ListingBoxes() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {listingItems.map((item) => {
        const Icon = item.icon;

        if (item.id === 2) {
          return (
            <UploadPhotosDialog key={item.id}>
              <Button
                type="button"
                variant="ghost"
                className="h-auto w-full p-0 hover:bg-transparent"
              >
                <Card
                  className={cn(
                    "group cursor-pointer transition-all hover:shadow-lg",
                    `bg-gradient-to-br ${item.gradient}`,
                  )}
                >
                  <CardContent className="flex flex-col items-center justify-center p-8">
                    <div className="bg-primary/10 group-hover:bg-primary/20 mb-4 rounded-full p-4 transition-colors">
                      <Icon className="text-primary h-8 w-8" />
                    </div>
                    <h3 className="text-center text-lg font-semibold">
                      {item.title}
                    </h3>
                  </CardContent>
                </Card>
              </Button>
            </UploadPhotosDialog>
          );
        }

        return (
          <Link key={item.id} href={item.href}>
            <Card
              className={cn(
                "group cursor-pointer transition-all hover:shadow-lg",
                `bg-gradient-to-br ${item.gradient}`,
              )}
            >
              <CardContent className="flex flex-col items-center justify-center p-8">
                <div className="bg-primary/10 group-hover:bg-primary/20 mb-4 rounded-full p-4 transition-colors">
                  <Icon className="text-primary h-8 w-8" />
                </div>
                <h3 className="text-center text-lg font-semibold">
                  {item.title}
                </h3>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
