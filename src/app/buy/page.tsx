"use client";

import React from "react";
import { api } from "@/trpc/react";
import { ListingCard } from "@/app/_components/listing-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BuyFilters } from "./_components/buy-filters";

export default function BuyPage() {
  const [page, setPage] = React.useState(1);
  const [manufacturer, setManufacturer] = React.useState<string>("");
  const [model, setModel] = React.useState<string>("");
  const [year, setYear] = React.useState<string>("");
  const [condition, setCondition] = React.useState<string>("all");
  const [minPrice, setMinPrice] = React.useState<string>("");
  const [maxPrice, setMaxPrice] = React.useState<string>("");

  const { data, isLoading, error } = api.listing.getAvailable.useQuery({
    manufacturer: manufacturer || undefined,
    model: model || undefined,
    year: year || undefined,
    condition: condition && condition !== "all" ? condition : undefined,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    page,
    limit: 20,
  });

  const handleSearch = () => {
    setPage(1); // Reset to first page on new search
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <section className="mb-6 flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Buy Rigs & Equipment
          </h1>
          <p className="text-muted-foreground text-sm">
            Browse available equipment listings
          </p>
        </div>
      </section>

      {/* Filters */}
      <BuyFilters products={data?.listings || []} />

      {/* Results */}
      {/* {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-4/3 w-full" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="flex min-h-[200px] items-center justify-center border-dashed">
          <p className="text-muted-foreground text-sm">
            Error loading listings. Please try again.
          </p>
        </Card>
      ) : !data || data.listings.length === 0 ? (
        <Card className="flex min-h-[200px] items-center justify-center border-dashed">
          <p className="text-muted-foreground text-sm">
            No listings available. Check back later!
          </p>
        </Card>
      ) : (
        <>
          <div className="text-muted-foreground mb-4 text-sm">
            Showing {data.listings.length} of {data.total} listings
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {data.listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          Pagination
          {data.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-muted-foreground text-sm">
                Page {page} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )} */}
    </main>
  );
}
