"use client";

import React from "react";
import { guideSteps } from "./guide-data";
import { GuideSection } from "./guide-section";

export function GuideSections() {
  return (
    <div className="space-y-16">
      {guideSteps.map((step) => (
        <GuideSection key={step.id} step={step} />
      ))}
    </div>
  );
}

