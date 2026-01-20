"use client";

import React from "react";
import { HelpCircle, Sparkles } from "lucide-react";
import { FAQSearch } from "./_components/faq-search";
import { FAQAccordion } from "./_components/faq-accordion";
import { HelpfulLinks } from "./_components/helpful-links";
import { faqSections } from "./_components/faq-data";

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [openItems, setOpenItems] = React.useState<string[]>([]);
  const [activeSection, setActiveSection] = React.useState<string>("");
  const isUserInteractionRef = React.useRef(false);

  // Handle URL hash on mount and when hash changes (only from external sources, not user clicks)
  React.useEffect(() => {
    const handleHashChange = () => {
      // Skip if this is from user interaction (accordion click)
      if (isUserInteractionRef.current) {
        isUserInteractionRef.current = false;
        return;
      }

      const hash = window.location.hash.slice(1); // Remove #
      if (hash) {
        // Format: sectionSlug-itemId (e.g., listing-equipment-how-to-list)
        const parts = hash.split("-");
        if (parts.length >= 2) {
          const sectionSlug = parts[0];
          const itemId = parts.slice(1).join("-");
          const itemIdFull = `${sectionSlug}-${itemId}`;

          // Open the accordion item
          setOpenItems((prev) => {
            if (!prev.includes(itemIdFull)) {
              return [...prev, itemIdFull];
            }
            return prev;
          });

          // Scroll to the section
          setTimeout(() => {
            const element = document.getElementById(hash);
            if (element) {
              const headerOffset = 100;
              const elementPosition = element.getBoundingClientRect().top;
              const offsetPosition =
                elementPosition + window.scrollY - headerOffset;
              window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
              });
            }
          }, 100);
        } else {
          // Just section slug
          const section = document.getElementById(hash);
          if (section) {
            const headerOffset = 100;
            const elementPosition = section.getBoundingClientRect().top;
            const offsetPosition =
              elementPosition + window.scrollY - headerOffset;
            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth",
            });
            setActiveSection(hash);
          }
        }
      }
    };

    // Handle initial hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Update active section based on scroll position
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;

      for (let i = faqSections.length - 1; i >= 0; i--) {
        const section = document.getElementById(faqSections[i]?.slug ?? "");
        if (section) {
          const sectionTop = section.offsetTop;
          if (scrollPosition >= sectionTop) {
            setActiveSection(faqSections[i]?.slug ?? "");
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleValueChange = (value: string[]) => {
    // Mark that this is a user interaction to prevent hash handler from reopening
    isUserInteractionRef.current = true;
    
    setOpenItems(value);
    
    // Update URL hash with the last opened item, or clear hash if all closed
    if (value.length > 0) {
      const lastItem = value[value.length - 1];
      window.history.replaceState(null, "", `#${lastItem}`);
    } else {
      // Clear hash when all accordions are closed
      window.history.replaceState(null, "", window.location.pathname);
    }
  };

  const handleItemOpen = (sectionSlug: string, itemId: string) => {
    const itemIdFull = `${sectionSlug}-${itemId}`;
    // This is handled by onValueChange, but we keep it for compatibility
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="mb-12 relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-background to-primary/20 border border-primary/10 p-8 sm:p-10 lg:p-12">
        <div className="relative z-10">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <HelpCircle className="size-6" />
            </div>
            <Sparkles className="text-primary/60 size-5" />
          </div>
          <h1 className="text-foreground mb-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Selling Your Equipment FAQs
          </h1>
          <p className="text-muted-foreground max-w-2xl text-base leading-relaxed sm:text-lg">
            Click on a question to have its answer displayed. Find answers to
            common questions about listing and selling your equipment with us.
          </p>
        </div>
        <div className="absolute -right-8 -top-8 size-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 size-64 rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* Search Bar */}
      <div className="mb-10">
        <FAQSearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
        {/* FAQ Content */}
        <div className="min-w-0">
          <FAQAccordion
            sections={faqSections}
            searchQuery={searchQuery}
            value={openItems}
            onValueChange={handleValueChange}
            onItemOpen={handleItemOpen}
          />
        </div>

        {/* Mobile Helpful Links */}
      <div className="">
        <HelpfulLinks />
      </div>
      </div>

     
    </main>
  );
}

