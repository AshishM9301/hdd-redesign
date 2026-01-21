"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { guideSteps } from "./guide-data";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface GuideStepOverviewProps {
  className?: string;
}

export function GuideStepOverview({ className }: GuideStepOverviewProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <h2 className="text-2xl font-bold tracking-tight">Listing Process Overview</h2>
      <p className="text-muted-foreground">
        Your journey to a successful listing in 7 simple steps
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-7">
        {guideSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <Link
              key={step.id}
              href={`#${step.id}`}
              className="group relative overflow-hidden rounded-xl border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative flex flex-col h-full">
                <div className="flex flex-col flex-1">

                <div className="mb-3 flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-radial from-blue-200/90 to-transparent text-primary">
                    <Icon className="size-5" />
                  </div>
                  <span className="text-sm font-semibold text-stone-50">
                    Step {step.number}/7
                  </span>
                </div>
                <h3 className="mb-1 font-semibold">{step.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {step.description}
                </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs text-blue-200">
                  <span>Learn more</span>
                  <ChevronRight className="size-3" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl  bg-gradient-to-br from-white/0 via-white/50  via-white/0  via-transparent to-white/0 p-4 sm:grid-cols-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">7</div>
          <div className="text-xs text-stone-50">Total Steps</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">10+</div>
          <div className="text-xs text-stone-50">Fields to Complete</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">20</div>
          <div className="text-xs text-stone-50">Photos Max</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">24h</div>
          <div className="text-xs text-stone-50">Avg. Response</div>
        </div>
      </div>
    </div>
  );
}
