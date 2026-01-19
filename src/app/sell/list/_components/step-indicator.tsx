"use client";

import React from "react";
import { cn } from "@/lib/utils";

type Step = {
  id: number;
  label: string;
};

type StepIndicatorProps = {
  currentStep: number;
  steps: Step[];
  completedSteps?: number[];
  visitedSteps?: number[];
  onStepClick?: (stepId: number) => void;
};

export default function StepIndicator({
  currentStep,
  steps,
  completedSteps = [],
  visitedSteps = [],
  onStepClick,
}: StepIndicatorProps) {
  const isStepCompleted = (stepId: number) => completedSteps.includes(stepId);
  const isStepVisited = (stepId: number) => visitedSteps.includes(stepId);

  // Check if step has required fields (steps 1 and 2)
  const hasRequiredFields = (stepId: number) => stepId === 1 ?? stepId === 2;

  // Step is clickable if:
  // 1. It's the current step, OR
  // 2. It's a required step (1 or 2) that is completed, OR
  // 3. It's an optional step (3, 4, 5) that has been visited
  const isStepClickable = (stepId: number) => {
    if (currentStep === stepId) return true;
    if (hasRequiredFields(stepId)) {
      return isStepCompleted(stepId);
    }
    return isStepVisited(stepId);
  };

  const handleStepClick = (stepId: number) => {
    if (isStepClickable(stepId) && onStepClick) {
      onStepClick(stepId);
    }
  };

  return (
    <div className="mb-8 flex items-center gap-2">
      {steps.map((step, index) => {
        const isCompleted = isStepCompleted(step.id);
        const isClickable = isStepClickable(step.id);
        const isCurrent = currentStep === step.id;
        const isVisited = isStepVisited(step.id);

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                onClick={() => handleStepClick(step.id)}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : isClickable
                      ? "cursor-pointer bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                      : "bg-muted text-muted-foreground cursor-not-allowed",
                )}
              >
                {step.label}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1",
                  hasRequiredFields(step.id)
                    ? isCompleted
                      ? "bg-primary"
                      : "bg-muted"
                    : isVisited
                      ? "bg-primary"
                      : "bg-muted",
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
