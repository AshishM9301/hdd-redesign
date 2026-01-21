"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Building2,
  CheckCircle2,
  Loader2,
  Mail,
  NotebookPen,
  Phone,
  Sparkles,
  User,
} from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { YearSelectDialog } from "@/app/sell/_components/year-select-dialog";
import { valueRequestCreateInput } from "@/types/value-request";
import type { ValueRequestCreateInput } from "@/types/value-request";

type FormValues = z.input<typeof valueRequestCreateInput>;

type UploadedFileMeta = NonNullable<ValueRequestCreateInput["files"]>[number];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

export default function ValueRequestForm() {
  const [submittedRef, setSubmittedRef] = React.useState<string | null>(null);
  const [files, setFiles] = React.useState<UploadedFileMeta[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(valueRequestCreateInput),
    defaultValues: {
      name: "",
      company: "",
      phone: "",
      email: "",
      preferredLanguage: "english",
      manufacturer: "",
      model: "",
      year: "",
      hours: "",
      description: "",
      files: [],
      consent: false,
      honeypot: "",
    },
    mode: "onSubmit",
  });

  const uploadMutation = api.mediaUpload.uploadFiles.useMutation({
    onError: (err) => {
      toast.error("Upload failed", { description: err.message });
    },
  });

  const mutation = api.valueRequest.create.useMutation({
    onSuccess: (data: { referenceNumber: string }) => {
      setSubmittedRef(data.referenceNumber);
      toast.success("Request submitted", {
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
    mutation.mutate({
      ...values,
      files,
    });
  };

  if (submittedRef) {
    return (
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <CheckCircle2 className="text-green-500" />
            Request received
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Thanks for submitting your equipment. Our team will review and follow up with a valuation.
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
    <Card className="border shadow-sm">
      <CardHeader className="space-y-1 text-left">
        <div className=" inline-flex items-start gap-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
          <Sparkles className="size-4 text-stone-400" />
          HDD Broker
        </div>
        <CardTitle className="text-xl font-bold tracking-tight sm:text-2xl">
          WHAT&apos;S YOUR EQUIPMENT WORTH?
        </CardTitle>
        <p className="text-muted-foreground  max-w-xl text-sm leading-relaxed">
          Complete the form below and we will get back to you to discuss fair market value.
          Be sure to include year, make, model, hours and photos for the most accurate appraisal.
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <input
            type="text"
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            {...form.register("honeypot")}
          />
          <FieldGroup className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field data-invalid={!!form.formState.errors.name}>
                  <FieldLabel htmlFor="name" className="text-sm font-semibold">
                    Name: <span className="text-red-500">*</span>
                  </FieldLabel>
                  <div className="space-y-1">
                    <div className="relative">
                      <User className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                      <Input id="name" placeholder="Your name" className="pl-9" {...form.register("name")} />
                    </div>
                    <FieldError errors={[form.formState.errors.name]} />
                  </div>
                </Field>

                <Field data-invalid={!!form.formState.errors.phone}>
                  <FieldLabel htmlFor="phone" className="text-sm font-semibold">
                    Phone: <span className="text-red-500">*</span>
                  </FieldLabel>
                  <div className="space-y-1">
                    <div className="relative">
                      <Phone className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                      <Input id="phone" placeholder="Phone" className="pl-9" {...form.register("phone")} />
                    </div>
                    <FieldError errors={[form.formState.errors.phone]} />
                  </div>
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field data-invalid={!!form.formState.errors.email}>
                  <FieldLabel htmlFor="email" className="text-sm font-semibold">
                    Email: <span className="text-red-500">*</span>
                  </FieldLabel>
                  <div className="space-y-1">
                    <div className="relative">
                      <Mail className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                      <Input id="email" placeholder="Email" className="pl-9" {...form.register("email")} />
                    </div>
                    <FieldError errors={[form.formState.errors.email]} />
                  </div>
                </Field>

                <Field data-invalid={!!form.formState.errors.company}>
                  <FieldLabel htmlFor="company" className="text-sm font-semibold">
                    Company:
                  </FieldLabel>
                  <div className="space-y-1">
                    <div className="relative">
                      <Building2 className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                      <Input id="company" placeholder="Company" className="pl-9" {...form.register("company")} />
                    </div>
                    <FieldError errors={[form.formState.errors.company]} />
                  </div>
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field data-invalid={!!form.formState.errors.manufacturer}>
                  <FieldLabel htmlFor="manufacturer" className="text-sm font-semibold">
                    Manufacturer:
                  </FieldLabel>
                  <div className="space-y-1">
                    <Input id="manufacturer" placeholder="Manufacturer" {...form.register("manufacturer")} />
                    <FieldError errors={[form.formState.errors.manufacturer]} />
                  </div>
                </Field>

                <Field data-invalid={!!form.formState.errors.model}>
                  <FieldLabel htmlFor="model" className="text-sm font-semibold">
                    Model:
                  </FieldLabel>
                  <div className="space-y-1">
                    <Input id="model" placeholder="Model" {...form.register("model")} />
                    <FieldError errors={[form.formState.errors.model]} />
                  </div>
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field data-invalid={!!form.formState.errors.year}>
                  <FieldLabel htmlFor="year" className="text-sm font-semibold">
                    Year:
                  </FieldLabel>
                  <div className="space-y-1">
                    <YearSelectDialog
                      value={form.watch("year") ?? ""}
                      onChange={(year) => form.setValue("year", year, { shouldValidate: true })}
                    />
                    <FieldError errors={[form.formState.errors.year]} />
                  </div>
                </Field>

                <Field data-invalid={!!form.formState.errors.hours}>
                  <FieldLabel htmlFor="hours" className="text-sm font-semibold">
                    Hours:
                  </FieldLabel>
                  <div className="space-y-1">
                    <Input id="hours" type="number" placeholder="Hours" {...form.register("hours")} />
                    <FieldError errors={[form.formState.errors.hours]} />
                  </div>
                </Field>
              </div>
            </div>

            <Field data-invalid={!!form.formState.errors.description}>
              <FieldLabel htmlFor="description" className="pt-2 text-sm font-semibold">
                Equipment Description:
              </FieldLabel>
              <div className="space-y-1">
                <div className="relative">
                  <NotebookPen className="text-muted-foreground absolute left-3 top-3 size-4" />
                  <Textarea
                    id="description"
                    rows={6}
                    className="pl-10 min-h-32"
                    placeholder="Tell us about your equipment"
                    {...form.register("description")}
                  />
                </div>
                <FieldError errors={[form.formState.errors.description]} />
              </div>
            </Field>

            <Field data-invalid={!!form.formState.errors.files}>
              <FieldLabel className="pt-2 text-sm font-semibold">Files:</FieldLabel>
              <div className="space-y-2">
                <div
                  className="rounded-md border bg-background p-4 text-center text-sm text-muted-foreground min-h-48 flex flex-col items-center justify-center"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={async (e) => {
                    e.preventDefault();
                    const dropped = Array.from(e.dataTransfer.files);
                    if (dropped.length === 0) return;

                    const toBase64 = (file: File) =>
                      new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                          const result = reader.result;
                          resolve(typeof result === "string" ? result : "");
                        };
                        reader.onerror = () => reject(new Error("Failed to read file"));
                        reader.readAsDataURL(file);
                      });

                    const payload = await Promise.all(
                      dropped.slice(0, 10).map(async (f) => ({
                        fileName: f.name,
                        mimeType: f.type || "application/octet-stream",
                        data: await toBase64(f),
                      })),
                    );

                    const uploaded = await uploadMutation.mutateAsync({ files: payload });
                    setFiles(uploaded);
                    toast.success("Files uploaded");
                  }}
                >
                  Drop photos and documents here
                  <div className="my-2 text-xs">or</div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadMutation.isPending}
                    onClick={() => document.getElementById("value-files-input")?.click()}
                  >
                    {uploadMutation.isPending ? "Uploading..." : "Select Files"}
                  </Button>
                  <input
                    id="value-files-input"
                    className="hidden"
                    type="file"
                    multiple
                    onChange={async (e) => {
                      const selected = Array.from(e.target.files ?? []);
                      if (selected.length === 0) return;

                      const toBase64 = (file: File) =>
                        new Promise<string>((resolve, reject) => {
                          const reader = new FileReader();
                          reader.onload = () => {
                            const result = reader.result;
                            resolve(typeof result === "string" ? result : "");
                          };
                          reader.onerror = () => reject(new Error("Failed to read file"));
                          reader.readAsDataURL(file);
                        });

                      const payload = await Promise.all(
                        selected.slice(0, 10).map(async (f) => ({
                          fileName: f.name,
                          mimeType: f.type || "application/octet-stream",
                          data: await toBase64(f),
                        })),
                      );

                      const uploaded = await uploadMutation.mutateAsync({ files: payload });
                      setFiles(uploaded);
                      toast.success("Files uploaded");
                      e.currentTarget.value = "";
                    }}
                  />
                </div>

                {files.length > 0 && (
                  <div className="rounded-md border bg-muted/30 p-3">
                    <p className="text-sm font-semibold text-foreground">Attached</p>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {files.map((f) => (
                        <li key={f.storagePath} className="flex items-center justify-between gap-3">
                          <span className="truncate">{f.fileName}</span>
                          <span className="shrink-0 text-xs">{formatBytes(f.fileSize)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setFiles([])}>
                        Remove files
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Field>

            <Field data-invalid={!!form.formState.errors.consent}>
              <div />
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-3">
                  <Checkbox
                    checked={form.watch("consent")}
                    onCheckedChange={(v) =>
                      form.setValue("consent", v === true, { shouldValidate: true })
                    }
                    aria-invalid={!!form.formState.errors.consent}
                  />
                  <span className="text-sm">I agree to be contacted about this valuation request</span>
                </label>
                <FieldError errors={[form.formState.errors.consent]} />
              </div>
            </Field>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-amber-500 text-black hover:bg-amber-600"
                disabled={mutation.isPending || uploadMutation.isPending}
                aria-busy={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Information"
                )}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
