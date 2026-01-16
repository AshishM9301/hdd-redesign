"use client";

import React from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const videos = [
  {
    title: "How To Find Serial Numbers For HDD Drills",
    date: "July 2, 2019",
    description: "Learn how to locate serial numbers on your HDD equipment.",
    href: "#",
    thumbnail: "/images/video-placeholder-1.jpg",
  },
  {
    title: "How To Upload Photos To Your Listing",
    date: "July 25, 2019",
    description: "Step-by-step guide to uploading photos for your listing.",
    href: "#",
    thumbnail: "/images/video-placeholder-2.jpg",
  },
  {
    title: "How To Upload Videos To Your Listing",
    date: "July 25, 2019",
    description: "Instructions for adding videos to showcase your equipment.",
    href: "#",
    thumbnail: "/images/video-placeholder-3.jpg",
  },
  {
    title: "Tips for Taking Good Photos",
    date: "July 21, 2019",
    description: "Best practices for photographing your equipment.",
    href: "#",
    thumbnail: "/images/video-placeholder-4.jpg",
  },
  {
    title: "The All New HDD Broker Listings Web App",
    date: "July 17, 2013",
    description: "Introduction to our new web application for listings.",
    href: "#",
    thumbnail: "/images/video-placeholder-5.jpg",
  },
  {
    title: "How to list your equipment on HDDBroker.com",
    date: "March 19, 2013",
    description: "Complete guide to listing your equipment on our platform.",
    href: "#",
    thumbnail: "/images/video-placeholder-6.jpg",
  },
];

export default function VideosSection() {
  return (
    <div>
      <h2 className="mb-6 text-3xl font-bold text-foreground">VIDEOS</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <Card key={video.title} className="overflow-hidden">
            <div className="relative aspect-video bg-muted">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                <div className="rounded-full bg-primary/80 p-4 backdrop-blur-sm">
                  <Play className="h-8 w-8 fill-white text-white" />
                </div>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{video.title}</CardTitle>
              <CardDescription>{video.date}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                {video.description}
              </p>
              <Button variant="link" asChild className="p-0">
                <Link href={video.href}>
                  Watch Now &gt;&gt;
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

