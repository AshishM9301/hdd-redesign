"use client";

import React from "react";
import {
  CheckCircle2,
  Lightbulb,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Camera,
  FileText,
  Upload,
  Eye,
  User,
  DollarSign,
  Handshake,
  Truck,
  FileCheck,
  RefreshCw,
  AlertOctagon,
  MessageCircle,
  PhoneCall,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { guideSteps } from "./guide-data";
import { sampleListingData } from "./guide-data";

interface GuideSectionProps {
  step: (typeof guideSteps)[number];
}

export function GuideSection({ step }: GuideSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const Icon = step.icon;

  // Get sample data for the step
  const getSampleData = () => {
    switch (step.number) {
      case 1:
        return sampleListingData.step1;
      case 2:
        return sampleListingData.step2;
      case 3:
        return sampleListingData.step3;
      default:
        return {};
    }
  };

  const sampleData = getSampleData();

  return (
    <section
      id={step.id}
      className={cn("scroll-mt-20 rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md", step.number === 6 && "bg-green-100/20 border-green-500", step.number === 7 && "bg-red-200/20 border-red-500")}
    >
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-radial from-white/90 to-transparent text-primary">
            <Icon className="size-6" />
          </div>
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Step {step.number} of 7
              </Badge>
              {step.number === 6 && (
                <Badge variant="default" className="text-xs bg-green-600">
                  Success
                </Badge>
              )}
              {step.number === 7 && (
                <Badge variant="destructive" className="text-xs">
                  Issues
                </Badge>
              )}
            </div>
            <h2 className="text-foreground text-2xl font-bold tracking-tight">
              {step.title}
            </h2>
            <p className="text-muted-foreground mt-1">{step.description}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="shrink-0"
        >
          {isExpanded ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-8">
          {/* Services Section for Step 6 (Success) */}
          {"services" in step && step.services && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Full-Service Transaction Support</h3>
              <p className="text-sm text-muted-foreground mb-4">
                HDD Broker handles every aspect of your transaction from beginning to end:
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {step.services.map((service, index) => {
                  const ServiceIcon = service.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-4 rounded-lg border bg-muted/30 p-4"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <ServiceIcon className="size-5" />
                      </div>
                      <div>
                        <p className="font-medium">{service.title}</p>
                        <p className="text-sm text-stone-400">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Issues Section for Step 7 */}
          {"issues" in step && step.issues && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Common Problems & Solutions</h3>
              <div className="space-y-4">
                {step.issues.map((issue, index) => {
                  const IssueIcon = issue.icon;
                  return (
                    <div
                      key={index}
                      className="rounded-lg border border-red-200 bg-red-50/50 dark:border-red-800/50 dark:bg-red-950/20 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                          <IssueIcon className="size-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-red-800 dark:text-red-200">
                            {issue.problem}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            <span className="font-medium text-green-600 dark:text-green-400">
                              Solution:{" "}
                            </span>
                            {issue.solution}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Field Guide - Only for steps 1-5 */}
          {step.number <= 5 && step.fields && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Field Guide</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {step.fields.map((field) => (
                  <div
                    key={field.name}
                    className="rounded-lg  bg-gradient-to-br from-white/30 via-white/10 via-transparent via-white/10 to-white/30 p-4 transition-colors hover:from-white/50 hover:via-white/30 hover:to-white/50"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium">{field.name}</span>
                      {field.required ? (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Optional
                        </Badge>
                      )}
                    </div>
                    <p className="mb-2 text-sm text-stone-400">
                      {field.description}
                    </p>
                    <div className="flex items-start gap-2 rounded-md bg-black p-2 text-sm">
                      <Lightbulb className="size-4 shrink-0 text-primary mt-0.5" />
                      <span className="text-primary">{field.tip}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips Section */}
          {step.tips && step.tips.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {step.number === 6 ? "What to Expect" : step.number === 7 ? "Need More Help?" : "Important Tips"}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {step.tips.map((tip, index) => (
                  <TipCard key={index} tip={tip} />
                ))}
              </div>
            </div>
          )}

          {/* Photo Guide for Step 4 */}
          {step.photoGuide && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Photo Requirements</h3>
              <div className="rounded-xl border bg-muted/30 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-radial from-white/90 to-white/10 text-primary">
                    <Camera className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium">Required Photo Angles</p>
                    <p className="text-sm text-stone-400">
                      Upload at least {step.photoGuide.minimumPhotos} photos for best results
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {step.photoGuide.recommendedAngles.map((angle) => (
                    <div
                      key={angle.name}
                      className="flex items-start gap-3 rounded-lg border bg-background p-3"
                    >
                      <div
                        className={cn(
                          "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                          angle.priority === "high"
                            ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
                        )}
                      >
                        {angle.priority === "high" ? "!" : "•"}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{angle.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {angle.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {step.photoGuide.tips && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">Pro Tips:</p>
                    <ul className="space-y-1">
                      {step.photoGuide.tips.map((tip, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-stone-300"
                        >
                          <CheckCircle2 className="size-4 shrink-0 text-green-500 mt-0.5" />
                          <span >{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Checklist */}
          {step.checklist && step.checklist.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Checklist</h3>
              <div className="rounded-xl border bg-muted/30 p-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  {step.checklist.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-500/40 text-blue-200">
                        <CheckCircle2 className="size-3" />
                      </div>
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Example Data - Only for steps 1-3 */}
          {Object.keys(sampleData).length > 0 && step.number <= 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Example Data</h3>
              <div className="rounded-xl border bg-muted/30 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-radial from-white/90 to-white/10 text-primary">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium">Sample Listing Data</p>
                    <p className="text-sm text-stone-400">
                      See how a completed listing might look
                    </p>
                  </div>
                </div>
                <div className="rounded-lg bg-background p-4 font-mono text-sm">
                  {Object.entries(sampleData).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between gap-4 border-b py-2 last:border-0"
                    >
                      <span className="text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// Tip Card Component
interface TipCardProps {
  tip: {
    type: "pro" | "warning" | "info";
    title: string;
    content: string;
  };
}

function TipCard({ tip }: TipCardProps) {
  const getTipStyles = (tipType: string) => {
    switch (tipType) {
      case "pro":
        return {
          icon: Lightbulb,
          bg: "bg-green-100/20 dark:bg-green-950 border-green-400 dark:border-green-800",
          iconBg: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
          iconClass: "text-green-600 dark:text-green-400",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          bg: "bg-red-100/20 dark:bg-red-950 border-red-200 dark:border-red-800",
          iconBg: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
          iconClass: "text-red-600 dark:text-red-400",
        };
      default:
        return {
          icon: Info,
          bg: "bg-blue-100/20 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
          iconBg: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
          iconClass: "text-blue-600 dark:text-blue-400",
        };
    }
  };

  const styles = getTipStyles(tip.type);
  const Icon = styles.icon;

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        styles.bg,
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <div className={cn("flex size-8 items-center justify-center rounded-lg", styles.iconBg)}>
          <Icon className={cn("size-4", styles.iconClass)} />
        </div>
        <span className="font-medium">{tip.title}</span>
      </div>
      <p className="text-sm text-stone-400">{tip.content}</p>
    </div>
  );
}
