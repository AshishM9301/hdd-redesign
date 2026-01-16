"use client";

import React from "react";
import ListingForm from "./_components/listing-form";

export default function ListPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">LIST YOUR EQUIPMENT</h1>
      <ListingForm />
    </main>
  );
}

