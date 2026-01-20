"use client";

import React from "react";
import { Play, Search } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FAQSection, FAQItem } from "./faq-data";
import { cn } from "@/lib/utils";

interface FAQAccordionProps {
  sections: FAQSection[];
  searchQuery: string;
  value?: string[];
  onValueChange?: (value: string[]) => void;
  onItemOpen?: (sectionId: string, itemId: string) => void;
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) {
    return text;
  }

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) => {
    // Check if this part matches the query (case-insensitive)
    const matches = new RegExp(`^${escapedQuery}$`, "i").test(part);
    if (matches && part.trim()) {
      return (
        <mark
          key={index}
          className="bg-yellow-200 dark:bg-yellow-900/50 rounded px-0.5"
        >
          {part}
        </mark>
      );
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

function filterSections(
  sections: FAQSection[],
  searchQuery: string,
): Array<FAQSection & { filteredQuestions: FAQItem[] }> {
  if (!searchQuery.trim()) {
    return sections.map((section) => ({
      ...section,
      filteredQuestions: section.questions,
    }));
  }

  const query = searchQuery.toLowerCase().trim();

  return sections
    .map((section) => {
      const filteredQuestions = section.questions.filter((item) => {
        const questionMatch = item.question.toLowerCase().includes(query);
        const answerMatch = item.answer.toLowerCase().includes(query);
        const tagsMatch =
          item.tags?.some((tag) => tag.toLowerCase().includes(query)) ?? false;
        return questionMatch || answerMatch || tagsMatch;
      });

      return {
        ...section,
        filteredQuestions,
      };
    })
    .filter((section) => section.filteredQuestions.length > 0);
}

export function FAQAccordion({
  sections,
  searchQuery,
  value,
  onValueChange,
  onItemOpen,
}: FAQAccordionProps) {
  const filteredSections = filterSections(sections, searchQuery);
  const totalMatches = filteredSections.reduce(
    (sum, section) => sum + section.filteredQuestions.length,
    0,
  );

  if (searchQuery.trim() && totalMatches === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/30 py-16 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
          <Search className="text-muted-foreground size-8" />
        </div>
        <p className="text-foreground mb-2 text-lg font-semibold">
          No results found
        </p>
        <p className="text-muted-foreground mx-auto max-w-md text-sm">
          Try searching with different keywords or browse all questions below.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {searchQuery.trim() && totalMatches > 0 && (
        <div className="rounded-lg border bg-muted/50 px-4 py-3">
          <p className="text-stone-800 text-sm font-medium">
            Found <span className="text-foreground font-semibold">{totalMatches}</span>{" "}
            matching {totalMatches === 1 ? "question" : "questions"}
          </p>
        </div>
      )}
      <Accordion
        type="multiple"
        value={value}
        onValueChange={onValueChange}
        className="w-full space-y-6"
      >
        {filteredSections.map((section) => (
          <div
            key={section.id}
            id={section.slug}
            className="scroll-mt-20 rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md first:mt-0"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              <h2 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
                {section.title}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>
            <div className="space-y-2">
              {section.filteredQuestions.map((item) => {
                const itemId = `${section.slug}-${item.id}`;
                return (
                  <AccordionItem
                    key={item.id}
                    value={itemId}
                    id={itemId}
                    className="scroll-mt-20 rounded-lg border border-transparent px-4 transition-colors hover:border-border/50 hover:bg-muted/30"
                  >
                    <AccordionTrigger
                      className="text-left py-4 hover:no-underline"
                      onClick={() => onItemOpen?.(section.slug, item.id)}
                    >
                      <div className="flex items-start gap-3 pr-4">
                        <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
                          <Play className="size-3" />
                        </div>
                        <span className="flex-1 text-base font-medium leading-relaxed">
                          {highlightText(item.question, searchQuery)}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 pt-0">
                      <div className="text-muted-foreground pl-8 text-sm leading-relaxed">
                        {highlightText(item.answer, searchQuery)}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </div>
          </div>
        ))}
      </Accordion>
    </div>
  );
}

