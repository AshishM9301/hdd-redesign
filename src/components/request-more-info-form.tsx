"use client"

import React from "react"
import Link from "next/link"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Mail,
  Phone,
  Package,
  MessageSquare,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const languageEnum = z.enum(["english", "spanish", "french", "other"])
type Language = z.infer<typeof languageEnum>

export type RequestMoreInfoData = {
  referenceNumber: string
  equipmentDescription: string
  backHref: string
  returnToListingHref: string
}

function createSchema(referenceNumber: string) {
  return z.object({
    referenceNumber: z.literal(referenceNumber),
    name: z.string().trim().min(1, "Name is required."),
    company: z.string().trim().optional(),
    phone: z
      .string()
      .trim()
      .min(7, "Phone is required.")
      .regex(/^[+()\d.\-\s]{7,}$/, "Enter a valid phone number."),
    email: z.string().trim().email("Enter a valid email address."),
    language: languageEnum,
    message: z
      .string()
      .trim()
      .min(1, "Please specify what additional information you would like."),
    captcha: z
      .boolean()
      .refine((v) => v === true, "Please confirm you are not a robot."),
  })
}

export function RequestMoreInfoForm({ data }: { data: RequestMoreInfoData }) {
  const schema = React.useMemo(() => createSchema(data.referenceNumber), [data.referenceNumber])
  type Values = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      referenceNumber: data.referenceNumber,
      name: "",
      company: "",
      phone: "",
      email: "",
      language: "english" as Language,
      message: "",
      captcha: false,
    },
    mode: "onSubmit",
  })

  const captchaChecked = watch("captcha")

  const onSubmit = async (_values: Values) => {
    // demo-only submit (no API call)
    await new Promise((resolve) => setTimeout(resolve, 600))
    toast.success("Your request has been submitted (demo only)")
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="relative mb-12 overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/20 via-background to-primary/20 p-8 sm:p-10 lg:p-12">

        <div className="relative z-10">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MessageSquare className="size-6" />
            </div>
            <Sparkles className="size-5 text-primary/60" />
          </div>
          <h1 className="text-foreground mb-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            REQUEST MORE INFO
          </h1>
          <p className="text-muted-foreground max-w-2xl text-base leading-relaxed sm:text-lg">
            Fill out the form below and we&apos;ll get back to you shortly
          </p>
        </div>
        <div className="absolute -right-8 -top-8 size-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 size-64 rounded-full bg-primary/5 blur-3xl" />
      </section>

      <div className="relative mx-auto z-3 flex w-full  flex-col gap-8 ">





        <div className="flex flex-row-reverse gap-4">
          {/* Ways to Contact */}
          <section className="space-y-6  max-h-[600px] rounded-xl border border-slate-200 bg-white/80 p-8 shadow-lg backdrop-blur-sm max-w-xs ">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-slate-300" />
              <h2 className="text-center text-xl font-bold tracking-wide text-slate-800">
                WAYS TO CONTACT HDD BROKER
              </h2>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-300 to-slate-300" />
            </div>
            <div className="flex flex-col gap-4">
              <a
                href="tel:+18669603331"
                className="group flex flex-col gap-4 rounded-lg border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm transition-all hover:scale-[1.02] hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex items-end gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md transition-transform group-hover:scale-110">
                    <Phone className="size-5" />
                  </div>
                  <div className="text-lg font-medium uppercase tracking-wider text-slate-500">
                    Phone
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-semibold leading-6 tracking-wide text-slate-900">
                    +1.866.960.3331
                  </div>
                  <div className="text-lg font-semibold leading-6 tracking-wide text-slate-900">
                    +1.239.237.3744
                  </div>
                </div>
              </a>
              <a
                href="mailto:sales@hddbroker.com"
                className="group flex flex-col gap-4 rounded-lg border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm transition-all hover:scale-[1.02] hover:border-amber-300 hover:shadow-md"
              >
                <div className="flex items-end gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md transition-transform group-hover:scale-110">
                    <Mail className="size-5" />
                  </div>
                  <div className="text-lg font-medium uppercase tracking-wider text-slate-500">
                    Email
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-semibold leading-6 tracking-wide text-blue-600 transition-colors group-hover:text-blue-700">
                    sales@hddbroker.com
                  </div>
                </div>
              </a>
              <a
                href="#"
                className="group flex flex-col gap-4 rounded-lg border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm transition-all hover:scale-[1.02] hover:border-slate-300 hover:shadow-md"
              ><div className="flex items-end gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 text-white shadow-md transition-transform group-hover:scale-110">
                    <MessageSquare className="size-5" />
                  </div>
                  <div className="text-lg font-medium uppercase tracking-wider text-slate-500">
                    More Options
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-semibold leading-6 text-slate-900 transition-colors group-hover:text-slate-700">
                    Other Ways to Contact Us
                  </div>
                </div>
              </a>
            </div>
          </section>

          <div className="flex-1 flex flex-col gap-6">
            {/* You Were Looking At */}
            <section className="group relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 p-8 shadow-lg transition-all hover:shadow-xl">
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-12 -translate-y-12 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-400/20 blur-2xl transition-transform group-hover:scale-150" />
              <div className="relative flex flex-col items-center gap-4 text-center">
                <div className="flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2">
                  <Package className="size-5 text-amber-600" />
                  <p className="text-sm font-semibold uppercase tracking-[0.15em] text-amber-700">
                    You were looking at
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-slate-700">
                    Reference Number:{" "}
                    <span className="rounded-md bg-slate-900 px-3 py-1 font-mono text-lg font-bold text-white">
                      {data.referenceNumber}
                    </span>
                  </p>
                  <p className="text-base font-medium text-slate-600">
                    {data.equipmentDescription}
                  </p>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="group/btn mt-2 border-2 border-slate-800 bg-slate-900 text-white transition-all hover:scale-105 hover:border-slate-700 hover:bg-slate-800"
                >
                  <Link href={data.returnToListingHref}>
                    Return to Listing
                    <ArrowRight className="ml-2 size-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </section>

            {/* Form */}
            <section className="rounded-xl border border-slate-200 bg-black/80 p-8 shadow-lg backdrop-blur-sm flex-1">
              <div className="mb-8 flex items-center justify-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-slate-300" />
                <h2 className="flex items-center gap-2 text-center text-xl font-bold tracking-wide text-yellow-500">
                  <CheckCircle2 className="size-5 text-green-500" />
                  SUBMIT YOUR REQUEST HERE
                </h2>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-300 to-slate-300" />
              </div>

              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
                <FieldGroup className="space-y-6">
                  <Field data-invalid={!!errors.referenceNumber}>
                    <FieldLabel htmlFor="referenceNumber" className="text-sm font-semibold">
                      Reference Number
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id="referenceNumber"
                        readOnly
                        value={data.referenceNumber}
                        aria-invalid={!!errors.referenceNumber}
                        className="font-mono font-semibold"
                        {...register("referenceNumber")}
                      />
                      <FieldError errors={[errors.referenceNumber]} />
                    </FieldContent>
                  </Field>

                  <div className="grid gap-6 md:grid-cols-2">
                    <Field data-invalid={!!errors.name}>
                      <FieldLabel htmlFor="name" className="text-sm font-semibold">
                        Name <span className="text-red-500">*</span>
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          autoComplete="name"
                          aria-invalid={!!errors.name}
                          disabled={isSubmitting}
                          className="transition-all focus:ring-2 focus:ring-amber-500"
                          {...register("name")}
                        />
                        <FieldError errors={[errors.name]} />
                      </FieldContent>
                    </Field>

                    <Field data-invalid={!!errors.company}>
                      <FieldLabel htmlFor="company" className="text-sm font-semibold">
                        Company <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          id="company"
                          placeholder="Company Name"
                          autoComplete="organization"
                          aria-invalid={!!errors.company}
                          disabled={isSubmitting}
                          className="transition-all focus:ring-2 focus:ring-amber-500"
                          {...register("company")}
                        />
                        <FieldError errors={[errors.company]} />
                      </FieldContent>
                    </Field>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <Field data-invalid={!!errors.phone}>
                      <FieldLabel htmlFor="phone" className="text-sm font-semibold">
                        Phone <span className="text-red-500">*</span>
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          autoComplete="tel"
                          aria-invalid={!!errors.phone}
                          disabled={isSubmitting}
                          className="transition-all focus:ring-2 focus:ring-amber-500"
                          {...register("phone")}
                        />
                        <FieldError errors={[errors.phone]} />
                      </FieldContent>
                    </Field>

                    <Field data-invalid={!!errors.email}>
                      <FieldLabel htmlFor="email" className="text-sm font-semibold">
                        Email <span className="text-red-500">*</span>
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          autoComplete="email"
                          aria-invalid={!!errors.email}
                          disabled={isSubmitting}
                          className="transition-all focus:ring-2 focus:ring-amber-500"
                          {...register("email")}
                        />
                        <FieldError errors={[errors.email]} />
                      </FieldContent>
                    </Field>
                  </div>

                  <Field data-invalid={!!errors.language}>
                    <FieldLabel htmlFor="language" className="text-sm font-semibold">
                      Preferred Language
                    </FieldLabel>
                    <FieldContent>
                      <Select
                        defaultValue="english"
                        onValueChange={(value) =>
                          setValue("language", value as Language, { shouldValidate: true })
                        }
                      >
                        <SelectTrigger
                          aria-invalid={!!errors.language}
                          className="w-full transition-all focus:ring-2 focus:ring-amber-500"
                        >
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="spanish">Spanish</SelectItem>
                          <SelectItem value="french">French</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldError errors={[errors.language]} />
                    </FieldContent>
                  </Field>

                  <Field data-invalid={!!errors.message}>
                    <FieldLabel htmlFor="message" className="text-sm font-semibold">
                      Your Message <span className="text-red-500">*</span>
                    </FieldLabel>
                    <FieldContent>
                      <Textarea
                        id="message"
                        placeholder="Please specify what additional information you would like to see..."
                        rows={6}
                        aria-invalid={!!errors.message}
                        disabled={isSubmitting}
                        className="resize-none transition-all focus:ring-2 focus:ring-amber-500"
                        {...register("message")}
                      />
                      <FieldError errors={[errors.message]} />
                    </FieldContent>
                  </Field>

                  <Field data-invalid={!!errors.captcha}>
                    <FieldLabel className="sr-only">Captcha</FieldLabel>
                    <FieldContent>
                      <div className="flex items-center justify-between rounded-lg border-slate-100 bg-gradient-to-br from-yellow-50/60 to-yellow-100/20 px-6 py-5 transition-all hover:border-slate-300 data-[invalid=true]:border-red-300">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={captchaChecked}
                            aria-invalid={!!errors.captcha}
                            disabled={isSubmitting}
                            className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                            onCheckedChange={(v) =>
                              setValue("captcha", v === true, { shouldValidate: true })
                            }
                          />
                          <span className="text-sm font-medium text-slate-100">
                            I&apos;m not a robot
                          </span>
                        </div>
                        <div className="flex gap-4 text-xs text-yellow-500">
                          <a
                            href="#"
                            className="transition-colors hover:text-yellow-600 hover:underline"
                          >
                            Privacy
                          </a>
                          <a
                            href="#"
                            className="transition-colors hover:text-yellow-600 hover:underline"
                          >
                            Terms
                          </a>
                        </div>
                      </div>
                      <FieldError errors={[errors.captcha]} />
                    </FieldContent>
                  </Field>

                  <Field>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 text-base font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:from-amber-600 hover:via-orange-600 hover:to-amber-500 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
                      disabled={isSubmitting}
                      aria-busy={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-5 animate-spin" />
                          <span>Submitting Your Request...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Request</span>
                          <ArrowRight className="ml-2 size-5" />
                        </>
                      )}
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}


