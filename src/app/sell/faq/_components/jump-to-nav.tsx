"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import type { FAQSection } from "./faq-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JumpToNavProps {
  sections: FAQSection[];
  activeSection?: string;
}

export function JumpToNav({ sections, activeSection }: JumpToNavProps) {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToSection = (slug: string) => {
    const element = document.getElementById(slug);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };


  if (!mounted) {
    return null;
  }

  if (isMobile) {
    return (
      <div className="sticky top-4 z-10 mb-6">
        <Select
          value={activeSection ?? sections[0]?.slug}
          onValueChange={(value) => scrollToSection(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Jump to section..." />
          </SelectTrigger>
          <SelectContent>
            {sections.map((section) => (
              <SelectItem key={section.id} value={section.slug}>
                {section.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="sticky top-8 hidden lg:block">
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <p className="text-foreground mb-4 text-sm font-semibold uppercase tracking-wide">
          Jump to:
        </p>
        <div className="space-y-1.5">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.slug ? "secondary" : "ghost"}
              className="w-full justify-start text-left transition-all hover:translate-x-1"
              onClick={() => scrollToSection(section.slug)}
            >
              <span className="truncate text-sm">{section.title}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

