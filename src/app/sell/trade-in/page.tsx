"use client";

import { HelpCircle, Sparkles } from "lucide-react";
import { HelpfulLinks } from "@/app/sell/faq/_components/helpful-links";
import TradeInForm from "./_components/trade-in-form";

export default function TradeInPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="relative mb-12 overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/20 via-background to-primary/20 p-8 sm:p-10 lg:p-12">
        <div className="relative z-10">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <HelpCircle className="size-6" />
            </div>
            <Sparkles className="size-5 text-primary/60" />
          </div>
          <h1 className="text-foreground mb-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Trade In Your Equipment
          </h1>
          <p className="text-muted-foreground max-w-2xl text-base leading-relaxed sm:text-lg">
            Tell us about your equipment and we&apos;ll get you a competitive trade-in
            value quickly. Our team will review and follow up with a tailored offer.
          </p>
        </div>
        <div className="absolute -right-8 -top-8 size-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 size-64 rounded-full bg-primary/5 blur-3xl" />
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          <TradeInForm />
        </div>
        <div className="">
          <HelpfulLinks />
        </div>
      </div>
    </main>
  );
}

