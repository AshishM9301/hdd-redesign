"use client";

import { useMemo, useState, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ListingWithRelations } from "@/types/listing";
import { MediaFileType } from "@/types/listing";
import { ListingCard } from "@/app/_components/listing-card";

type BuyFiltersProps = {
  products: ListingWithRelations[];
};

// Rig bucket definitions for display pills
const RIG_BUCKETS = [
  {
    id: "light",
    label: "Light",
    rangeLabel: "0 – 10,000 lbs",
    min: 0,
    max: 10000,
  },
  {
    id: "mid1",
    label: "Mid Small",
    rangeLabel: "10,001 – 20,000 lbs",
    min: 10001,
    max: 20000,
  },
  {
    id: "mid2",
    label: "Mid Medium",
    rangeLabel: "20,001 – 30,000 lbs",
    min: 20001,
    max: 30000,
  },
  {
    id: "mid3",
    label: "Mid Large",
    rangeLabel: "30,001 – 50,000 lbs",
    min: 30001,
    max: 50000,
  },
  {
    id: "heavy1",
    label: "Heavy Small",
    rangeLabel: "50,001 – 100,000 lbs",
    min: 50001,
    max: 100000,
  },
  {
    id: "heavy2",
    label: "Heavy Medium",
    rangeLabel: "100,001 – 200,000 lbs",
    min: 100001,
    max: 200000,
  },
  {
    id: "ultra",
    label: "Ultra",
    rangeLabel: "200,001+ lbs",
    min: 200001,
    max: Infinity,
  },
] as const;

const COLOR_OPTIONS = [
  { id: "green", label: "Green", className: "bg-emerald-500" },
  { id: "orange", label: "Orange", className: "bg-orange-500" },
  { id: "blue", label: "Blue", className: "bg-sky-500" },
  { id: "pink", label: "Pink", className: "bg-pink-500" },
  { id: "purple", label: "Purple", className: "bg-violet-500" },
];

export const BuyFilters = ({ products }: BuyFiltersProps) => {
  // Global page search (searches products)
  const [pageSearch, setPageSearch] = useState("");

  // Filter states
  const [assuranceOnly, setAssuranceOnly] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>(
    [],
  );
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [onlyWithVideo, setOnlyWithVideo] = useState(false);
  const [onlyWithPictures, setOnlyWithPictures] = useState(false);

  // Internal filter searches (for manufacturer/model lists)
  const [manufacturerFilterSearch, setManufacturerFilterSearch] = useState("");
  const [modelFilterSearch, setModelFilterSearch] = useState("");

  // Compute available filter options
  const {
    categories,
    manufacturers,
    models,
    minPrice,
    maxPrice,
    rigMin,
    rigMax,
  } = useMemo(() => {
    if (products.length === 0) {
      return {
        categories: [] as string[],
        manufacturers: [] as string[],
        models: [] as string[],
        minPrice: 0,
        maxPrice: 0,
        rigMin: 0,
        rigMax: 0,
      };
    }

    const prices = products.map((p) => Number(p.askingPrice));
    // Note: lbsPullback doesn't exist in Listing schema, using 0 as default
    const rigValues: number[] = [];

    // Use condition as category since Listing doesn't have category
    const uniqueCategories = Array.from(
      new Set(products.map((p) => p.condition)),
    ).sort();

    const uniqueManufacturers = Array.from(
      new Set(
        products
          .map((p) => p.manufacturer)
          .filter((m): m is string => m !== undefined && m.length > 0),
      ),
    ).sort();

    const uniqueModels = Array.from(
      new Set(
        products
          .map((p) => p.model)
          .filter((m): m is string => m !== undefined && m.length > 0),
      ),
    ).sort();

    return {
      categories: uniqueCategories,
      manufacturers: uniqueManufacturers,
      models: uniqueModels,
      minPrice: prices.length > 0 ? Math.min(...prices) : 0,
      maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
      rigMin: rigValues.length > 0 ? Math.min(...rigValues) : 0,
      rigMax: rigValues.length > 0 ? Math.max(...rigValues) : 200000,
    };
  }, [products]);

  // Price range state
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [priceRangeInitialized, setPriceRangeInitialized] = useState(false);

  // Rig range state
  const [rigRange, setRigRange] = useState<[number, number]>([0, 0]);
  const [rigRangeInitialized, setRigRangeInitialized] = useState(false);

  // Update ranges when computed values change
  useEffect(() => {
    if (minPrice > 0 && maxPrice > 0 && maxPrice >= minPrice) {
      if (!priceRangeInitialized) {
        // First time: set to full range
        setPriceRange([minPrice, maxPrice]);
        setPriceRangeInitialized(true);
      } else {
        // After initialization: only update if current range is invalid
        setPriceRange((prev) => {
          const [prevMin, prevMax] = prev;
          // If range is outside new bounds, clamp it
          if (prevMin < minPrice || prevMax > maxPrice) {
            return [
              Math.max(minPrice, Math.min(prevMin, maxPrice)),
              Math.min(maxPrice, Math.max(prevMax, minPrice)),
            ];
          }
          return prev;
        });
      }
    }
  }, [minPrice, maxPrice, priceRangeInitialized]);

  useEffect(() => {
    if (rigMin > 0 && rigMax > 0 && rigMax >= rigMin) {
      if (!rigRangeInitialized) {
        setRigRange([rigMin, rigMax]);
        setRigRangeInitialized(true);
      } else {
        setRigRange((prev) => {
          const [prevMin, prevMax] = prev;
          if (prevMin < rigMin || prevMax > rigMax) {
            return [
              Math.max(rigMin, Math.min(prevMin, rigMax)),
              Math.min(rigMax, Math.max(prevMax, rigMin)),
            ];
          }
          return prev;
        });
      }
    }
  }, [rigMin, rigMax, rigRangeInitialized]);

  // Compute active rig buckets based on current range
  const activeRigBuckets = useMemo(() => {
    return RIG_BUCKETS.filter((bucket) => {
      const bucketMin = bucket.min;
      const bucketMax = bucket.max === Infinity ? 999999999 : bucket.max;
      return bucketMax >= rigRange[0] && bucketMin <= rigRange[1];
    });
  }, [rigRange]);

  // Filtered manufacturers and models (by internal search)
  const filteredManufacturers = useMemo(() => {
    if (!manufacturerFilterSearch.trim()) return manufacturers;
    const searchLower = manufacturerFilterSearch.toLowerCase();
    return manufacturers.filter((m) => m.toLowerCase().includes(searchLower));
  }, [manufacturers, manufacturerFilterSearch]);

  const filteredModels = useMemo(() => {
    if (!modelFilterSearch.trim()) return models;
    const searchLower = modelFilterSearch.toLowerCase();
    return models.filter((m) => m.toLowerCase().includes(searchLower));
  }, [models, modelFilterSearch]);

  // Main filtering logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Global page search
      const title = `${product.manufacturer} ${product.model}`;
      const description = product.listingDetails?.generalDescription ?? "";
      const matchesSearch =
        pageSearch.trim().length === 0 ||
        title.toLowerCase().includes(pageSearch.toLowerCase()) ||
        description.toLowerCase().includes(pageSearch.toLowerCase()) ||
        product.condition.toLowerCase().includes(pageSearch.toLowerCase()) ||
        product.manufacturer?.toLowerCase().includes(pageSearch.toLowerCase()) ||
        product.model?.toLowerCase().includes(pageSearch.toLowerCase());

      // Equipment Assurance - not available in Listing schema, so always pass if filter is off
      const matchesAssurance = !assuranceOnly;

      // Category (using condition as category)
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.condition);

      // Manufacturer
      const matchesManufacturer =
        selectedManufacturers.length === 0 ||
        (product.manufacturer &&
          selectedManufacturers.includes(product.manufacturer));

      // Model
      const matchesModel =
        selectedModels.length === 0 ||
        (product.model && selectedModels.includes(product.model));

      // Rig Range - not available in Listing schema, so always pass
      const matchesRigRange = true;

      // Price Range
      const productPrice = Number(product.askingPrice);
      const matchesPrice =
        productPrice >= priceRange[0] && productPrice <= priceRange[1];

      // Media filters
      const hasVideo =
        product.mediaAttachments?.some(
          (m) => m.fileType === MediaFileType.VIDEO,
        ) ?? false;
      const matchesVideo = !onlyWithVideo || hasVideo;

      const hasPictures =
        product.mediaAttachments?.some(
          (m) => m.fileType === MediaFileType.IMAGE,
        ) ?? false;
      const matchesPictures = !onlyWithPictures || hasPictures;

      // Color (UI only for now)
      const matchesColor = selectedColorId ? true : true;

      return (
        matchesSearch &&
        matchesAssurance &&
        matchesCategory &&
        matchesManufacturer &&
        matchesModel &&
        matchesRigRange &&
        matchesPrice &&
        matchesVideo &&
        matchesPictures &&
        matchesColor
      );
    });
  }, [
    products,
    pageSearch,
    assuranceOnly,
    selectedCategories,
    selectedManufacturers,
    selectedModels,
    rigRange,
    priceRange,
    onlyWithVideo,
    onlyWithPictures,
    selectedColorId,
  ]);

  const toggleInArray = (value: string, current: string[]) => {
    return current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
      {/* Filter Column */}
      <Card className="border-muted bg-background sticky top-4 h-fit max-h-[calc(100vh-2rem)]">
        <div className="flex flex-col gap-6 p-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight">Filters</h2>
          </div>

          {/* Equipment Assurance Toggle - Top of Filters */}
          <div className="border-muted bg-muted/30 flex items-center justify-between gap-2 rounded-md border p-3">
            <Label
              htmlFor="assurance-toggle"
              className="text-xs leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Equipment Assurance Only
            </Label>
            <Switch
              id="assurance-toggle"
              checked={assuranceOnly}
              onCheckedChange={setAssuranceOnly}
            />
          </div>

          <ScrollArea className="h-[720px] max-h-[calc(100vh-200px)] pr-2">
            <Accordion
              type="multiple"
              defaultValue={[
                "category",
                "manufacturer",
                "rig-range",
                "price",
                "features",
              ]}
              className="space-y-4"
            >
              {/* Category Filter */}
              <AccordionItem value="category" className="border-none">
                <AccordionTrigger className="py-0 text-xs font-semibold tracking-wide uppercase">
                  Category
                </AccordionTrigger>
                <AccordionContent className="mt-3 space-y-2">
                  {categories.length === 0 ? (
                    <p className="text-muted-foreground text-xs">
                      No categories available.
                    </p>
                  ) : (
                    categories.map((category) => (
                      <label
                        key={category}
                        className="flex cursor-pointer items-center gap-2 text-xs"
                      >
                        <Checkbox
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() =>
                            setSelectedCategories((prev) =>
                              toggleInArray(category, prev),
                            )
                          }
                          className="h-3.5 w-3.5 rounded-[3px]"
                        />
                        <span className="line-clamp-1 capitalize">
                          {category.replace(/-/g, " ")}
                        </span>
                      </label>
                    ))
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Manufacturer Filter */}
              <AccordionItem value="manufacturer" className="border-none">
                <AccordionTrigger className="py-0 text-xs font-semibold tracking-wide uppercase">
                  Manufacturer
                </AccordionTrigger>
                <AccordionContent className="mt-3 space-y-2">
                  <Input
                    value={manufacturerFilterSearch}
                    onChange={(e) =>
                      setManufacturerFilterSearch(e.target.value)
                    }
                    placeholder="Search manufacturer..."
                    className="h-8 text-xs"
                  />
                  {filteredManufacturers.length === 0 ? (
                    <p className="text-muted-foreground text-xs">
                      No manufacturers found.
                    </p>
                  ) : (
                    filteredManufacturers.map((manufacturer) => (
                      <label
                        key={manufacturer}
                        className="flex cursor-pointer items-center gap-2 text-xs"
                      >
                        <Checkbox
                          checked={selectedManufacturers.includes(manufacturer)}
                          onCheckedChange={() =>
                            setSelectedManufacturers((prev) =>
                              toggleInArray(manufacturer, prev),
                            )
                          }
                          className="h-3.5 w-3.5 rounded-[3px]"
                        />
                        <span className="line-clamp-1">{manufacturer}</span>
                      </label>
                    ))
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Advanced Filters - Model */}
              <AccordionItem value="advanced" className="border-none">
                <AccordionTrigger className="py-0 text-xs font-semibold tracking-wide uppercase">
                  Advanced Filters
                </AccordionTrigger>
                <AccordionContent className="mt-3 space-y-3">
                  <div>
                    <Label className="mb-2 block text-xs font-medium">
                      Model
                    </Label>
                    <Input
                      value={modelFilterSearch}
                      onChange={(e) => setModelFilterSearch(e.target.value)}
                      placeholder="Search model..."
                      className="mb-2 h-8 text-xs"
                    />
                    {filteredModels.length === 0 ? (
                      <p className="text-muted-foreground text-xs">
                        No models found.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {filteredModels.map((model) => (
                          <label
                            key={model}
                            className="flex cursor-pointer items-center gap-2 text-xs"
                          >
                            <Checkbox
                              checked={selectedModels.includes(model)}
                              onCheckedChange={() =>
                                setSelectedModels((prev) =>
                                  toggleInArray(model, prev),
                                )
                              }
                              className="h-3.5 w-3.5 rounded-[3px]"
                            />
                            <span className="line-clamp-1">{model}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Rig Range Filter */}
              <AccordionItem value="rig-range" className="border-none">
                <AccordionTrigger className="py-0 text-xs font-semibold tracking-wide uppercase">
                  Rig Range
                </AccordionTrigger>
                <AccordionContent className="mt-4 space-y-3">
                  <Slider
                    min={rigMin}
                    max={rigMax}
                    step={1000}
                    value={rigRange}
                    onValueChange={(value) =>
                      setRigRange([value[0], value[1]] as [number, number])
                    }
                  />
                  <div className="text-muted-foreground flex items-center justify-between text-[11px]">
                    <span>{rigRange[0].toLocaleString()} lbs</span>
                    <span>{rigRange[1].toLocaleString()} lbs</span>
                  </div>
                  {/* Active Rig Bucket Pills */}
                  {activeRigBuckets.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {activeRigBuckets.map((bucket) => (
                        <Badge
                          key={bucket.id}
                          variant="secondary"
                          className="text-[10px] font-normal"
                        >
                          {bucket.label}
                        </Badge>
                      ))}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Price Range Filter */}
              <AccordionItem value="price" className="border-none">
                <AccordionTrigger className="py-0 text-xs font-semibold tracking-wide uppercase">
                  Price Range
                </AccordionTrigger>
                <AccordionContent className="mt-4 space-y-3">
                  <Slider
                    min={minPrice}
                    max={maxPrice}
                    step={1}
                    value={priceRange}
                    onValueChange={(value) =>
                      setPriceRange([value[0], value[1]] as [number, number])
                    }
                  />
                  <div className="text-muted-foreground flex items-center justify-between text-[11px]">
                    <span>${priceRange[0].toFixed(0)}</span>
                    <span>${priceRange[1].toFixed(0)}</span>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Listing Features */}
              <AccordionItem value="features" className="border-none">
                <AccordionTrigger className="py-0 text-xs font-semibold tracking-wide uppercase">
                  Listing Features
                </AccordionTrigger>
                <AccordionContent className="mt-3 space-y-2">
                  <label className="flex cursor-pointer items-center gap-2 text-xs">
                    <Checkbox
                      checked={onlyWithVideo}
                      onCheckedChange={(checked) =>
                        setOnlyWithVideo(checked === true)
                      }
                      className="h-3.5 w-3.5 rounded-[3px]"
                    />
                    <span>Has Video</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-xs">
                    <Checkbox
                      checked={onlyWithPictures}
                      onCheckedChange={(checked) =>
                        setOnlyWithPictures(checked === true)
                      }
                      className="h-3.5 w-3.5 rounded-[3px]"
                    />
                    <span>Has Pictures</span>
                  </label>
                </AccordionContent>
              </AccordionItem>

              {/* Color Filter */}
              <AccordionItem value="color" className="border-none">
                <AccordionTrigger className="py-0 text-xs font-semibold tracking-wide uppercase">
                  Color
                </AccordionTrigger>
                <AccordionContent className="mt-3 flex flex-wrap gap-3">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() =>
                        setSelectedColorId((prev) =>
                          prev === color.id ? null : color.id,
                        )
                      }
                      className="border-muted-foreground/20 flex h-5 w-5 items-center justify-center rounded-full border"
                      aria-label={color.label}
                    >
                      <span
                        className={`h-3 w-3 rounded-full ${color.className}`}
                      />
                    </button>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </ScrollArea>
        </div>
      </Card>

      {/* Main Content Area */}
      <div className="space-y-4">
        {/* Global Page Search */}
        <div>
          <Input
            value={pageSearch}
            onChange={(e) => setPageSearch(e.target.value)}
            placeholder="Search rigs by title, description, manufacturer, model..."
            className="h-10 w-full"
          />
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Showing <Badge variant="secondary">{filteredProducts.length}</Badge>{" "}
            of {products.length} listing{products.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card className="flex min-h-[200px] items-center justify-center border-dashed">
            <p className="text-muted-foreground text-sm">
              No rigs match the selected filters.
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {filteredProducts.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyFilters;
