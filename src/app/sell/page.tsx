import React from "react";
import ListingBoxes from "./_components/listing-boxes";
import InfoCheckSection from "./_components/info-check-section";
import VideosSection from "./_components/videos-section";
import Link from "next/link";

const SellPage = () => {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12">
        <h1 className="text-foreground mb-4 text-4xl font-bold">
          SELLING YOUR EQUIPMENT IS EASY!
        </h1>
        <p className="text-muted-foreground text-lg">
          The first step to selling your equipment is to list it on our website.
          Need help? Contact us at{" "}
          <a
            href="mailto:listings@hddbroker.com"
            className="text-primary hover:text-primary/80 underline"
          >
            listings@hddbroker.com
          </a>{" "}
          or call us at{" "}
          <a
            href="tel:+12392562344"
            className="text-primary hover:text-primary/80 underline"
          >
            +1.239.256.2344
          </a>
          .
        </p>
      </section>

      {/* Listing Your Equipment Section */}
      <section className="mb-12">
        <h2 className="text-foreground mb-6 text-3xl font-bold">
          LISTING YOUR EQUIPMENT
        </h2>
        <ListingBoxes />
        <p className="text-muted-foreground mt-6">
          View our <Link href="/sell/guide" className="text-primary hover:text-primary/80 underline">Listing Guide</Link> to make sure you include everything.
        </p>
      </section>

      {/* Info Check Section */}
      <section className="mb-12">
        <InfoCheckSection />
      </section>

      {/* Videos Section */}
      <section className="mb-12">
        <VideosSection />
      </section>

      {/* Bottom Info */}
      <section className="bg-muted/50 rounded-lg border p-6">
        <p className="text-muted-foreground">
          Please allow up to one business day to process your listing. You will
          receive a confirmation when it has been processed. We add a commission
          on top of your asking price - this is the price that will appear on
          the website. You don&apos;t pay any fees to sell your equipment with
          us!
        </p>
      </section>
    </main>
  );
};

export default SellPage;
