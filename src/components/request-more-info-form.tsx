"use client"

import React from "react"
import Link from "next/link"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { ArrowLeft, Loader2, Mail, Phone } from "lucide-react"

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
    <div className="bg-muted/40 min-h-screen">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 md:px-8 md:py-12">
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" className="gap-2">
            <Link href={data.backHref}>
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
        </div>

        <Card className="border shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-extrabold tracking-wide md:text-3xl">
              REQUEST MORE INFO
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-10">
            {/* You Were Looking At */}
            <section className="rounded-lg border bg-white/70 p-6 shadow-sm">
              <div className="flex flex-col items-center gap-3 text-center">
                <p className="text-base uppercase tracking-[0.25em] text-muted-foreground">
                  You were looking at
                </p>
                <p className="text-lg font-semibold">
                  Reference Number:{" "}
                  <span className="font-bold">{data.referenceNumber}</span>
                </p>
                <p className="text-lg font-medium text-muted-foreground">
                  {data.equipmentDescription}
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="mt-2 bg-slate-800 text-white hover:bg-slate-700"
                >
                  <Link href={data.returnToListingHref}>Return to Listing</Link>
                </Button>
              </div>
            </section>

            {/* Ways to Contact */}
            <section className="rounded-lg border bg-white/70 p-6 shadow-sm">
              <h2 className="mb-4 text-center text-lg font-semibold tracking-wide">
                WAYS TO CONTACT HDD BROKER
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-start gap-3 rounded-md bg-slate-50 p-4">
                  <div className="rounded-full bg-slate-200 p-2">
                    <Phone className="size-4 text-slate-700" />
                  </div>
                  <div className="text-sm font-medium leading-6">
                    <div>+1.866.960.3331</div>
                    <div>+1.239.237.3744</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-md bg-slate-50 p-4">
                  <div className="rounded-full bg-slate-200 p-2">
                    <Mail className="size-4 text-slate-700" />
                  </div>
                  <div className="text-sm font-medium leading-6">
                    <a className="hover:underline" href="mailto:sales@hddbroker.com">
                      sales@hddbroker.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-md bg-slate-50 p-4">
                  <div className="rounded-full bg-slate-200 p-2">
                    <ArrowLeft className="size-4 rotate-180 text-slate-700" />
                  </div>
                  <div className="text-sm font-medium leading-6">
                    <a className="hover:underline" href="#">
                      Other Ways to Contact Us
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Form */}
            <section className="rounded-lg border bg-white/70 p-6 shadow-sm">
              <h2 className="mb-6 text-center text-lg font-semibold tracking-wide">
                SUBMIT YOUR REQUEST HERE
              </h2>

              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
                <FieldGroup>
                  <Field orientation="responsive" data-invalid={!!errors.referenceNumber}>
                    <FieldLabel htmlFor="referenceNumber">Reference Number</FieldLabel>
                    <FieldContent>
                      <Input
                        id="referenceNumber"
                        readOnly
                        value={data.referenceNumber}
                        aria-invalid={!!errors.referenceNumber}
                        {...register("referenceNumber")}
                      />
                      <FieldError errors={[errors.referenceNumber]} />
                    </FieldContent>
                  </Field>

                  <Field orientation="responsive" data-invalid={!!errors.name}>
                    <FieldLabel htmlFor="name">Name *</FieldLabel>
                    <FieldContent>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        autoComplete="name"
                        aria-invalid={!!errors.name}
                        disabled={isSubmitting}
                        {...register("name")}
                      />
                      <FieldError errors={[errors.name]} />
                    </FieldContent>
                  </Field>

                  <Field orientation="responsive" data-invalid={!!errors.company}>
                    <FieldLabel htmlFor="company">Company</FieldLabel>
                    <FieldContent>
                      <Input
                        id="company"
                        placeholder="Company (optional)"
                        autoComplete="organization"
                        aria-invalid={!!errors.company}
                        disabled={isSubmitting}
                        {...register("company")}
                      />
                      <FieldError errors={[errors.company]} />
                    </FieldContent>
                  </Field>

                  <Field orientation="responsive" data-invalid={!!errors.phone}>
                    <FieldLabel htmlFor="phone">Phone *</FieldLabel>
                    <FieldContent>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        autoComplete="tel"
                        aria-invalid={!!errors.phone}
                        disabled={isSubmitting}
                        {...register("phone")}
                      />
                      <FieldError errors={[errors.phone]} />
                    </FieldContent>
                  </Field>

                  <Field orientation="responsive" data-invalid={!!errors.email}>
                    <FieldLabel htmlFor="email">Email *</FieldLabel>
                    <FieldContent>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        aria-invalid={!!errors.email}
                        disabled={isSubmitting}
                        {...register("email")}
                      />
                      <FieldError errors={[errors.email]} />
                    </FieldContent>
                  </Field>

                  <Field orientation="responsive" data-invalid={!!errors.language}>
                    <FieldLabel htmlFor="language">Preferred Language</FieldLabel>
                    <FieldContent>
                      <Select
                        defaultValue="english"
                        onValueChange={(value) =>
                          setValue("language", value as Language, { shouldValidate: true })
                        }
                      >
                        <SelectTrigger aria-invalid={!!errors.language} className="w-full">
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

                  <Field orientation="responsive" data-invalid={!!errors.message}>
                    <FieldLabel htmlFor="message">Your Message *</FieldLabel>
                    <FieldContent>
                      <Textarea
                        id="message"
                        placeholder="Please specify what additional information you would like to see..."
                        rows={5}
                        aria-invalid={!!errors.message}
                        disabled={isSubmitting}
                        {...register("message")}
                      />
                      <FieldError errors={[errors.message]} />
                    </FieldContent>
                  </Field>

                  <Field orientation="responsive" data-invalid={!!errors.captcha}>
                    <FieldLabel className="sr-only">Captcha</FieldLabel>
                    <FieldContent>
                      <div className="border-input bg-slate-50 flex items-center justify-between rounded-md border px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={captchaChecked}
                            aria-invalid={!!errors.captcha}
                            disabled={isSubmitting}
                            onCheckedChange={(v) =>
                              setValue("captcha", v === true, { shouldValidate: true })
                            }
                          />
                          <span className="text-sm">I&apos;m not a robot</span>
                        </div>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <a href="#" className="hover:underline">
                            Privacy
                          </a>
                          <a href="#" className="hover:underline">
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
                      className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 text-white shadow-md transition hover:from-amber-600 hover:via-orange-600 hover:to-amber-500"
                      disabled={isSubmitting}
                      aria-busy={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        "Submit Request"
                      )}
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


