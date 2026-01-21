"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Sparkles } from "lucide-react";
import { GuideStepOverview } from "./_components/guide-step-overview";
import { GuideSections } from "./_components/guide-sections";
import { GuideSidebar } from "./_components/guide-sidebar";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export default function GuidePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="mb-12 relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-background to-primary/20 border border-primary/10 p-8 sm:p-10 lg:p-12">
        <div className="relative z-10">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="size-6" />
            </div>
            <Sparkles className="text-primary/60 size-5" />
          </div>
          <h1 className="text-foreground mb-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Complete Listing Guide
          </h1>
          <p className="text-muted-foreground max-w-2xl text-base leading-relaxed sm:text-lg">
            A step-by-step guide to creating a successful equipment listing. Learn how to
            fill out each section, what information buyers need, and how to showcase your
            equipment for faster sales.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Button asChild size="lg" className="gap-2">
              <Link href="/sell/list">
                <Upload className="size-5" />
                <span>Start Listing</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/sell/listing-sample">View Sample Listing</Link>
            </Button>
          </div>
        </div>
        <div className="absolute -right-8 -top-8 size-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 size-64 rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* Step Overview */}
      <div className="mb-10">
        <GuideStepOverview />
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
        {/* Main Content */}
        <div className="min-w-0">
          <GuideSections />
        </div>

        {/* Sidebar */}
        <div className="">
          <GuideSidebar />
        </div>
      </div>
    </main>
  );
}

