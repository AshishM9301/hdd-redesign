"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { MapPin, DollarSign, Loader2, ChevronDown, Info, CheckSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { makeOfferSchema } from "@/lib/validation/offer";

interface MakeOfferFormProps {
  listingId: string;
  listingData: {
    referenceNumber?: string | null;
    manufacturer: string;
    model: string;
    year: string;
    askingPrice: number | string;
    currency: string;
    condition: string;
    hours?: string | null;
    city?: string | null;
    stateProvince?: string | null;
    country?: string | null;
    sellerName?: string | null;
    sellerEmail?: string | null;
    images: Array<{
      id: string;
      thumbnailUrl: string;
    }>;
  };
}

// Type for form values
type MakeOfferFormValues = {
  listingId: string;
  offerAmount: string;
  phone?: string;
  message?: string;
  // Offer conditions checkboxes
  buyerInspection: boolean;
  thirdPartyInspection: boolean;
  financing: boolean;
  otherTerms: boolean;
  // Combined condition string
  condition?: string;
  // Other terms textarea
  buyerAdditionalTerms?: string;
};

export function MakeOfferForm({ listingId, listingData }: MakeOfferFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);

  const createOfferMutation = api.listing.createOffer.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      router.push(`/listings/${listingData.manufacturer}-${listingData.model}-${listingData.year}`);
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to submit offer. Please try again.");
      setShowConfirmDialog(false);
    },
  });

  const form = useForm<MakeOfferFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    resolver: zodResolver(makeOfferSchema) as any,
    defaultValues: {
      listingId,
      offerAmount: "",
      phone: "",
      message: "",
      // Condition checkboxes
      buyerInspection: false,
      thirdPartyInspection: false,
      financing: false,
      otherTerms: false,
      // Buyer additional terms
      buyerAdditionalTerms: "",
    },
  });

  const onSubmit = (values: MakeOfferFormValues) => {
    setShowConfirmDialog(true);
  };

  const handleConfirmOffer = () => {
    const values = form.getValues();
    // Build conditions string from checkboxes
    const conditions: string[] = [];
    if (values.buyerInspection) conditions.push("Satisfactory buyer inspection");
    if (values.thirdPartyInspection) conditions.push("Satisfactory third-party inspection");
    if (values.financing) conditions.push("Financing");
    if (values.otherTerms) conditions.push(`Other: ${values.buyerAdditionalTerms}`);

    createOfferMutation.mutate({
      listingId,
      offerAmount: Number(values.offerAmount),
      phone: values.phone,
      message: values.message,
    });
  };

  const formatPrice = (price: number | string) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: listingData.currency ?? "USD",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Check if offer is valid (greater than or equal to asking price)
  const offerAmount = form.watch("offerAmount");
  const offerAmountNum = typeof offerAmount === "string" ? parseFloat(offerAmount) : Number(offerAmount);
  const askingPrice = typeof listingData.askingPrice === "string"
    ? parseFloat(listingData.askingPrice)
    : listingData.askingPrice;
  const isOfferValid = offerAmountNum > 0 && offerAmountNum >= askingPrice;
  const offerError = offerAmountNum > 0 && offerAmountNum < askingPrice
    ? `Offer must be at least ${formatPrice(askingPrice)}`
    : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
      {/* Left: Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Your Offer</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Offer Amount */}
              <FormField
                control={form.control}
                name="offerAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Offer Amount *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          {...field}
                          type="text"
                          placeholder="Enter your offer"
                          className="pl-9"
                          disabled={createOfferMutation.isPending}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        />
                      </div>
                    </FormControl>
                    {offerError && (
                      <p className="text-sm text-red-500 mt-1">{offerError}</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Offer Conditions Accordion */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="conditions" className="border-yellow-400/30">
                  <AccordionTrigger className="text-amber-600 hover:text-amber-700 py-3">
                    <div className="flex items-center gap-2">
                      <ChevronDown className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">Offer Conditions (Optional)</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-4 pt-2">
                      {/* Condition Checkboxes */}
                      <div className="space-y-3">
                        <FormLabel className="text-sm font-medium">My offer is contingent upon:</FormLabel>
                        <div className="grid gap-3">
                          <FormField
                            control={form.control}
                            name="buyerInspection"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-yellow-400/30 p-3 bg-yellow-400/5 hover:bg-yellow-400/10 transition-colors">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={createOfferMutation.isPending}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm cursor-pointer font-normal">
                                    Satisfactory buyer inspection of the equipment
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="thirdPartyInspection"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-yellow-400/30 p-3 bg-yellow-400/5 hover:bg-yellow-400/10 transition-colors">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={createOfferMutation.isPending}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm cursor-pointer font-normal">
                                    Satisfactory third-party inspection of the equipment
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="financing"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-yellow-400/30 p-3 bg-yellow-400/5 hover:bg-yellow-400/10 transition-colors">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={createOfferMutation.isPending}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm cursor-pointer font-normal">
                                    Financing
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="otherTerms"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-yellow-400/30 p-3 bg-yellow-400/5 hover:bg-yellow-400/10 transition-colors">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={createOfferMutation.isPending}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm cursor-pointer font-normal">
                                    Other (please specify):
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Other Terms Textarea - shown when "other" is checked */}
                      <FormField
                        control={form.control}
                        name="buyerAdditionalTerms"
                        render={({ field }) => (
                          <FormItem className={form.watch("otherTerms") ? "" : "opacity-50"}>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Please specify other conditions..."
                                rows={3}
                                disabled={createOfferMutation.isPending || !form.watch("otherTerms")}
                                className={!form.watch("otherTerms") ? "pointer-events-none" : ""}
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground text-right">
                              {field.value?.split(/\s+/).filter(Boolean).length ?? 0} / 300 words
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Optional Fields Accordion */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="optional" className="border-yellow-400/30">
                  <AccordionTrigger className="text-amber-600 hover:text-amber-700 py-3">
                    <div className="flex items-center gap-2">
                      <ChevronDown className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">Add Phone & Message (Optional)</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-4 pt-2">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                disabled={createOfferMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message for Seller</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Introduce yourself and explain your offer..."
                                rows={4}
                                disabled={createOfferMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Separator />

              {/* Important Information Accordion */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="info" className="border-yellow-400/30">
                  <AccordionTrigger className="text-amber-600 hover:text-amber-700 py-3">
                    <div className="flex items-center gap-2">
                      <ChevronDown className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">Important Information</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-4 pt-2 text-sm text-muted-foreground">
                      <div className="bg-yellow-400/10 rounded-lg p-4 border border-yellow-400/20">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                          <div className="space-y-2">
                            <p className="font-medium text-amber-700">Deposit Requirements</p>
                            <p>
                              A 10% deposit is typically required to hold a package. Some sellers may require full payment up front in order to take the equipment off the market.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-400/10 rounded-lg p-4 border border-yellow-400/20">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                          <div className="space-y-2">
                            <p className="font-medium text-amber-700">Third-Party Inspections</p>
                            <p>
                              Third-party inspections are usually done by an independent provider. Qualified third-parties often include Vermeer/Ditch Witch/American Auger etc. dealers or an eligible mechanic with extensive knowledge and experience. They have no pre-existing relationship with either the buyer or the seller.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Submit Button with Confirmation Dialog */}
              <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    disabled={createOfferMutation.isPending || !isOfferValid}
                    className="w-full bg-linear-to-r from-amber-600 to-amber-700 text-black hover:from-amber-600/90 hover:to-amber-700/90 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
                  >
                    {createOfferMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Offer"
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
                      <CheckSquare className="h-5 w-5" />
                      Confirm Your Offer
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3 pt-2">
                      <p className="text-base font-medium">
                        {user?.name ?? "Buyer"} is making an offer for:
                      </p>
                      <div className="bg-yellow-400/10 rounded-lg p-4 border border-yellow-400/20 space-y-2">
                        <p className="font-semibold text-lg">
                          {listingData.manufacturer} {listingData.model} ({listingData.year})
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Seller: {listingData.sellerName ?? "N/A"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Location: {[listingData.city, listingData.stateProvince, listingData.country].filter(Boolean).join(", ") || "N/A"}
                        </p>
                      </div>
                      <p className="text-sm">
                        Once submitted, the seller will review your offer. Your offer is not binding until accepted by the seller.
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleConfirmOffer}
                      disabled={createOfferMutation.isPending || !isOfferValid}
                      className="bg-amber-600 text-black hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {createOfferMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Confirm Offer"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <p className="text-xs text-muted-foreground text-center">
                By submitting an offer, you agree to our terms and conditions.
                Your offer is not binding until accepted by the seller.
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Right: Listing Summary */}
      <Card className="h-fit lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle className="text-base">Equipment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image */}
          {listingData.images.length > 0 && (
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <Image
                src={listingData.images[0]!.thumbnailUrl}
                alt={`${listingData.manufacturer} ${listingData.model}`}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Equipment Details */}
          <div className="space-y-4">
            {/* Title */}
            <div>
              <h3 className="text-xl font-bold leading-tight">
                {listingData.manufacturer} {listingData.model} ({listingData.year})
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{listingData.condition}</p>
              {listingData.hours && (
                <p className="text-sm text-muted-foreground">{listingData.hours}</p>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-yellow-400/20 rounded-lg p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Manufacturer</p>
                <p className="font-semibold text-sm mt-0.5">{listingData.manufacturer}</p>
              </div>
              <div className="bg-yellow-400/20 rounded-lg p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Model</p>
                <p className="font-semibold text-sm mt-0.5">{listingData.model}</p>
              </div>
              <div className="bg-yellow-400/20 rounded-lg p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Year</p>
                <p className="font-semibold text-sm mt-0.5">{listingData.year}</p>
              </div>
              <div className="bg-yellow-400/20 rounded-lg p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Condition</p>
                <p className="font-semibold text-sm mt-0.5">{listingData.condition}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Location */}
          {(listingData.city ?? listingData.stateProvince ?? listingData.country) && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {[listingData.city, listingData.stateProvince, listingData.country]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          )}

          {/* Price */}
          <div>
            <p className="text-sm text-muted-foreground">Asking Price</p>
            <p className="text-2xl font-bold">{formatPrice(listingData.askingPrice)}</p>
          </div>

          <Separator />

          <div className="text-base text-muted-foreground">
            <p>
              Ref: <span className="font-mono font-bold text-amber-500">{listingData.referenceNumber ?? "N/A"}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
