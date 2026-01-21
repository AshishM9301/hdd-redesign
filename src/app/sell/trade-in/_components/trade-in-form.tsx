"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Building2,
  CheckCircle2,
  Globe2,
  Loader2,
  MapPin,
  NotebookPen,
  Phone,
  Sparkles,
  Tag,
  User,
} from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import type {
  tradeInLanguageEnum,
  TradeInCreateInput,
} from "@/types/trade-in";
import { tradeInCreateInput } from "@/types/trade-in";

type FormValues = z.input<typeof tradeInCreateInput>;

export default function TradeInForm() {
  const [submittedRef, setSubmittedRef] = React.useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(tradeInCreateInput),
    defaultValues: {
      name: "",
      company: "",
      phone: "",
      email: "",
      preferredLanguage: "english",
      category: "",
      manufacturer: "",
      model: "",
      year: "",
      hours: "",
      condition: "",
      country: "",
      stateProvince: "",
      message: "",
      consent: false,
      honeypot: "",
    },
    mode: "onSubmit",
  });

  const mutation = api.tradeIn.create.useMutation({
    onSuccess: (data: { referenceNumber: string }) => {
      setSubmittedRef(data.referenceNumber);
      toast.success("Trade-in submitted", {
        description: `Reference: ${data.referenceNumber}`,
      });
    },
    onError: (err) => {
      toast.error("Unable to submit right now", {
        description: err.message,
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values as TradeInCreateInput);
  };

  if (submittedRef) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <CheckCircle2 className="text-green-500" />
            Request received
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Thanks for submitting your equipment. Our team will review and follow up with a trade-in offer.
          </p>
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm font-semibold text-foreground">Reference Number</p>
            <p className="font-mono text-lg font-bold text-primary">{submittedRef}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setSubmittedRef(null)}>
              Submit another
            </Button>
            <Button asChild>
              <a href="/sell">Back to Sell</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-3 text-primary">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="size-5" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-wide">Trade-In Form</p>
        </div>
        <CardTitle className="text-2xl font-bold">Tell us about your equipment</CardTitle>
        <p className="text-muted-foreground text-sm">
          Provide details so we can give you a fast, accurate trade-in value.
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <input
            type="text"
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            {...form.register("honeypot")}
          />
          <FieldGroup className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel htmlFor="name">Name *</FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <User className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                    <Input
                      id="name"
                      placeholder="Jane Doe"
                      autoComplete="name"
                      className="pl-9"
                      {...form.register("name")}
                    />
                  </div>
                  <FieldError errors={[form.formState.errors.name]} />
                </FieldContent>
              </Field>

              <Field data-invalid={!!form.formState.errors.company}>
                <FieldLabel htmlFor="company">Company</FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <Building2 className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                    <Input
                      id="company"
                      placeholder="Company Name"
                      autoComplete="organization"
                      className="pl-9"
                      {...form.register("company")}
                    />
                  </div>
                  <FieldError errors={[form.formState.errors.company]} />
                </FieldContent>
              </Field>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Field data-invalid={!!form.formState.errors.phone}>
                <FieldLabel htmlFor="phone">Phone *</FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <Phone className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      autoComplete="tel"
                      className="pl-9"
                      {...form.register("phone")}
                    />
                  </div>
                  <FieldError errors={[form.formState.errors.phone]} />
                </FieldContent>
              </Field>

              <Field data-invalid={!!form.formState.errors.email}>
                <FieldLabel htmlFor="email">Email *</FieldLabel>
                <FieldContent>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...form.register("email")}
                  />
                  <FieldError errors={[form.formState.errors.email]} />
                </FieldContent>
              </Field>
            </div>

            <Field data-invalid={!!form.formState.errors.preferredLanguage}>
              <FieldLabel htmlFor="preferredLanguage">Preferred Language</FieldLabel>
              <FieldContent>
                <Select
                  defaultValue="english"
                  onValueChange={(v) =>
                    form.setValue("preferredLanguage", v as z.infer<typeof tradeInLanguageEnum>, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger id="preferredLanguage">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError errors={[form.formState.errors.preferredLanguage]} />
              </FieldContent>
            </Field>

            <div className="grid gap-6 md:grid-cols-2">
              <Field data-invalid={!!form.formState.errors.category}>
                <FieldLabel htmlFor="category">Equipment Category *</FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <Tag className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                    <Input
                      id="category"
                      placeholder="Drill / Rig / Reamer"
                      className="pl-9"
                      {...form.register("category")}
                    />
                  </div>
                  <FieldError errors={[form.formState.errors.category]} />
                </FieldContent>
              </Field>

              <Field data-invalid={!!form.formState.errors.condition}>
                <FieldLabel htmlFor="condition">Condition</FieldLabel>
                <FieldContent>
                  <Input
                    id="condition"
                    placeholder="New / Used / Needs work"
                    {...form.register("condition")}
                  />
                  <FieldError errors={[form.formState.errors.condition]} />
                </FieldContent>
              </Field>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Field data-invalid={!!form.formState.errors.manufacturer}>
                <FieldLabel htmlFor="manufacturer">Manufacturer</FieldLabel>
                <FieldContent>
                  <Input
                    id="manufacturer"
                    placeholder="Vermeer, Ditch Witch..."
                    {...form.register("manufacturer")}
                  />
                  <FieldError errors={[form.formState.errors.manufacturer]} />
                </FieldContent>
              </Field>

              <Field data-invalid={!!form.formState.errors.model}>
                <FieldLabel htmlFor="model">Model</FieldLabel>
                <FieldContent>
                  <Input id="model" placeholder="Model" {...form.register("model")} />
                  <FieldError errors={[form.formState.errors.model]} />
                </FieldContent>
              </Field>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Field data-invalid={!!form.formState.errors.year}>
                <FieldLabel htmlFor="year">Year</FieldLabel>
                <FieldContent>
                  <Input id="year" placeholder="2022" {...form.register("year")} />
                  <FieldError errors={[form.formState.errors.year]} />
                </FieldContent>
              </Field>

              <Field data-invalid={!!form.formState.errors.hours}>
                <FieldLabel htmlFor="hours">Hours</FieldLabel>
                <FieldContent>
                  <Input id="hours" placeholder="1024" {...form.register("hours")} />
                  <FieldError errors={[form.formState.errors.hours]} />
                </FieldContent>
              </Field>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Field data-invalid={!!form.formState.errors.country}>
                <FieldLabel htmlFor="country">Country</FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <Globe2 className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                    <Input
                      id="country"
                      placeholder="United States"
                      className="pl-9"
                      {...form.register("country")}
                    />
                  </div>
                  <FieldError errors={[form.formState.errors.country]} />
                </FieldContent>
              </Field>

              <Field data-invalid={!!form.formState.errors.stateProvince}>
                <FieldLabel htmlFor="stateProvince">State / Region</FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <MapPin className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                    <Input
                      id="stateProvince"
                      placeholder="FL / Ontario / NSW"
                      className="pl-9"
                      {...form.register("stateProvince")}
                    />
                  </div>
                  <FieldError errors={[form.formState.errors.stateProvince]} />
                </FieldContent>
              </Field>
            </div>

            <Field data-invalid={!!form.formState.errors.message}>
              <FieldLabel htmlFor="message">Description *</FieldLabel>
              <FieldContent>
                <div className="relative">
                  <NotebookPen className="text-muted-foreground absolute left-3 top-3 size-4" />
                  <Textarea
                    id="message"
                    rows={5}
                    placeholder="Include condition, accessories, recent work, and anything that affects value."
                    className="pl-10"
                    {...form.register("message")}
                  />
                </div>
                <FieldError errors={[form.formState.errors.message]} />
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.consent}>
              <FieldLabel className="text-sm font-medium">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={form.watch("consent")}
                    onCheckedChange={(v) => form.setValue("consent", v === true, { shouldValidate: true })}
                    aria-invalid={!!form.formState.errors.consent}
                  />
                  <span>I agree to be contacted about this trade-in request</span>
                </div>
              </FieldLabel>
              <FieldContent>
                <FieldError errors={[form.formState.errors.consent]} />
              </FieldContent>
            </Field>

            <Field>
              <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending}
                aria-busy={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit trade-in"
                )}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

