"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import {
  ALL_ALLOWED_MEDIA_MIME_TYPES,
  MEDIA_UPLOAD_LIMITS,
} from "@/types/media";
import { AlertCircle, FileText, Image as ImageIcon, Loader2, Upload, Video, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type UploadableKind = "image" | "video" | "document";

type SelectedFile = {
  file: File;
  previewUrl?: string;
  kind: UploadableKind;
};

const recipientOptions = [{ value: "LISTINGS", label: "Listings Department" }] as const;

const uploadPhotosSchema = z.object({
  contactName: z.string().trim().min(1, "Your name is required"),
  email: z.string().trim().email("Valid email required"),
  phone: z.string().optional(),
  recipient: z.enum(["LISTINGS"]),
  message: z.string().optional(),
  referenceNumber: z.string().optional(),
});

type UploadPhotosValues = z.infer<typeof uploadPhotosSchema>;

function classifyKind(mimeType: string): UploadableKind | null {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType === "application/pdf") return "document";
  return null;
}

function validateFileOnClient(file: File): { ok: true } | { ok: false; reason: string } {
  const mimeType = (file.type ?? "").toLowerCase();

  if (
    !ALL_ALLOWED_MEDIA_MIME_TYPES.includes(
      mimeType as (typeof ALL_ALLOWED_MEDIA_MIME_TYPES)[number],
    )
  ) {
    return { ok: false, reason: `File type ${mimeType ?? "unknown"} is not allowed` };
  }

  const kind = classifyKind(mimeType);
  if (!kind) return { ok: false, reason: "Unsupported file type" };

  const maxBytes =
    kind === "image"
      ? MEDIA_UPLOAD_LIMITS.imageMaxBytes
      : kind === "video"
        ? MEDIA_UPLOAD_LIMITS.videoMaxBytes
        : MEDIA_UPLOAD_LIMITS.documentMaxBytes;

  if (file.size <= 0) return { ok: false, reason: "File is empty" };
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    return { ok: false, reason: `File exceeds the ${mb}MB limit` };
  }

  return { ok: true };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Failed to convert file"));
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export default function UploadPhotosDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  const [open, setOpen] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = React.useState<SelectedFile[]>([]);
  const [progress, setProgress] = React.useState<{
    stage: "idle" | "preparing" | "uploading" | "submitting";
    current: number;
    total: number;
  }>({ stage: "idle", current: 0, total: 0 });
  const [referenceForPreview, setReferenceForPreview] = React.useState("");

  const form = useForm<UploadPhotosValues>({
    resolver: zodResolver(uploadPhotosSchema),
    defaultValues: {
      contactName: user?.name ?? "",
      email: user?.email ?? "",
      phone: "",
      recipient: "LISTINGS",
      message: "",
      referenceNumber: "",
    },
    mode: "onSubmit",
  });

  React.useEffect(() => {
    if (!open) return;
    // Prefill each time dialog opens (in case auth state changes)
    form.setValue("contactName", user?.name ?? "");
    form.setValue("email", user?.email ?? "");
  }, [open, user?.email, user?.name, form]);

  const watchedReference = form.watch("referenceNumber");

  // Debounce reference number changes before triggering preview lookup
  React.useEffect(() => {
    if (!watchedReference?.trim()) {
      setReferenceForPreview("");
      return;
    }

    const trimmed = watchedReference.trim();
    const handle = setTimeout(() => {
      setReferenceForPreview(trimmed);
    }, 400);

    return () => clearTimeout(handle);
  }, [watchedReference]);

  const listingPreviewQuery = api.listing.getByReference.useQuery(
    { referenceNumber: referenceForPreview },
    {
      enabled: Boolean(referenceForPreview),
      retry: 1,
    },
  );

  const uploadFiles = api.mediaUpload.uploadFiles.useMutation();
  const submitRequest = api.mediaUpload.submitUploadRequest.useMutation();

  const cleanupPreviews = React.useCallback((files: SelectedFile[]) => {
    for (const f of files) {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    }
  }, []);

  React.useEffect(() => {
    return () => cleanupPreviews(selectedFiles);
  }, [cleanupPreviews, selectedFiles]);

  const addFiles = React.useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;

      const next: SelectedFile[] = [];
      const rejects: string[] = [];

      for (const file of Array.from(fileList)) {
        const validation = validateFileOnClient(file);
        if (!validation.ok) {
          rejects.push(`${file.name}: ${validation.reason}`);
          continue;
        }

        const mimeType = (file.type ?? "").toLowerCase();
        const kind = classifyKind(mimeType);
        if (!kind) {
          rejects.push(`${file.name}: unsupported type`);
          continue;
        }

        const previewUrl =
          kind === "image" || kind === "video" ? URL.createObjectURL(file) : undefined;

        next.push({ file, kind, previewUrl });
      }

      if (rejects.length > 0) {
        toast.error("Some files were rejected", {
          description: rejects.slice(0, 3).join("\n") + (rejects.length > 3 ? "\n…" : ""),
        });
      }

      if (next.length === 0) return;

      setSelectedFiles((prev) => [...prev, ...next]);
    },
    [],
  );

  const removeFile = React.useCallback(
    (index: number) => {
      setSelectedFiles((prev) => {
        const toRemove = prev[index];
        if (toRemove?.previewUrl) URL.revokeObjectURL(toRemove.previewUrl);
        return prev.filter((_, i) => i !== index);
      });
    },
    [],
  );

  const resetAll = React.useCallback(() => {
    cleanupPreviews(selectedFiles);
    setSelectedFiles([]);
    setProgress({ stage: "idle", current: 0, total: 0 });
    form.reset({
      contactName: user?.name ?? "",
      email: user?.email ?? "",
      phone: "",
      recipient: "LISTINGS",
      message: "",
      referenceNumber: "",
    });
  }, [cleanupPreviews, form, selectedFiles, user?.email, user?.name]);

  const isBusy =
    uploadFiles.isPending ?? submitRequest.isPending ?? progress.stage !== "idle";

  const onSubmit = form.handleSubmit(async (values) => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file.");
      return;
    }

    try {
      setProgress({ stage: "preparing", current: 0, total: selectedFiles.length });

      const payloadFiles = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const f = selectedFiles[i]!;
        setProgress({ stage: "preparing", current: i + 1, total: selectedFiles.length });
        payloadFiles.push({
          data: await fileToBase64(f.file),
          fileName: f.file.name,
          mimeType: f.file.type,
        });
      }

      setProgress({ stage: "uploading", current: 0, total: selectedFiles.length });
      const uploaded = await uploadFiles.mutateAsync({ files: payloadFiles });

      setProgress({ stage: "submitting", current: 1, total: 1 });
      const request = await submitRequest.mutateAsync({
        contactName: values.contactName,
        email: values.email,
        phone: values.phone?.trim() ? values.phone.trim() : undefined,
        message: values.message?.trim() ? values.message.trim() : undefined,
        referenceNumber: values.referenceNumber?.trim()
          ? values.referenceNumber.trim()
          : undefined,
        files: uploaded,
      });

      const cancelHref = `/upload-requests/cancel?token=${encodeURIComponent(
        request.cancellationToken,
      )}`;

      toast.success("Upload request submitted", {
        duration: 10000,
        description: user
          ? "We received your files. We’ll review them shortly."
          : "We received your files. Save your cancellation link in case you need it.",
        action: user
          ? undefined
          : {
              label: "Cancellation link",
              onClick: () => {
                window.open(cancelHref, "_blank", "noopener,noreferrer");
              },
            },
      });

      resetAll();
      setOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast.error(message);
    } finally {
      setProgress({ stage: "idle", current: 0, total: 0 });
    }
  });

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const canClose = !isBusy;

  const progressText =
    progress.stage === "idle"
      ? null
      : progress.stage === "preparing"
        ? `Preparing files (${progress.current}/${progress.total})…`
        : progress.stage === "uploading"
          ? "Uploading files…"
          : "Submitting request…";

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !canClose) return;
        setOpen(nextOpen);
        if (!nextOpen) resetAll();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Upload Photos & Documents</DialogTitle>
          <DialogDescription>
            Send photos, videos, or a PDF document to be added to a listing.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-6" onSubmit={onSubmit}>
          <FieldGroup>
            <Field orientation="responsive" data-invalid={!!form.formState.errors.contactName}>
              <FieldLabel htmlFor="contactName">From</FieldLabel>
              <FieldContent>
                <Input
                  id="contactName"
                  placeholder="Your name"
                  disabled={isBusy}
                  {...form.register("contactName")}
                />
                <FieldError errors={[form.formState.errors.contactName]} />
              </FieldContent>
            </Field>

            <Field orientation="responsive" data-invalid={!!form.formState.errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <FieldContent>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={isBusy}
                  {...form.register("email")}
                />
                <FieldError errors={[form.formState.errors.email]} />
              </FieldContent>
            </Field>

            <Field orientation="responsive" data-invalid={!!form.formState.errors.phone}>
              <FieldLabel htmlFor="phone">Phone</FieldLabel>
              <FieldContent>
                <Input
                  id="phone"
                  placeholder="Optional"
                  disabled={isBusy}
                  {...form.register("phone")}
                />
                <FieldError errors={[form.formState.errors.phone]} />
              </FieldContent>
            </Field>

            <Field orientation="responsive">
              <FieldLabel>To</FieldLabel>
              <FieldContent>
                <Select
                  value={form.watch("recipient")}
                  onValueChange={(v) => form.setValue("recipient", v as "LISTINGS")}
                  disabled={isBusy}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipientOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            <Field orientation="responsive" data-invalid={!!form.formState.errors.referenceNumber}>
              <FieldLabel htmlFor="referenceNumber">Listing</FieldLabel>
              <FieldContent>
                <Input
                  id="referenceNumber"
                  placeholder="Reference # (Optional)"
                  disabled={isBusy}
                  {...form.register("referenceNumber")}
                />
                <FieldError errors={[form.formState.errors.referenceNumber]} />
              </FieldContent>
            </Field>

            {referenceForPreview && (
              <Card className="bg-muted/40">
                <CardContent className="space-y-1 py-3 text-sm">
                  {listingPreviewQuery.isLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Checking listing…</span>
                    </div>
                  )}

                  {listingPreviewQuery.error && !listingPreviewQuery.isLoading && (
                    <div className="flex items-start gap-2 text-destructive">
                      <AlertCircle className="mt-0.5 h-4 w-4" />
                      <p>{listingPreviewQuery.error.message}</p>
                    </div>
                  )}

                  {listingPreviewQuery.data && !listingPreviewQuery.isLoading && (
                    <div>
                      <p className="font-medium">
                        {listingPreviewQuery.data.manufacturer}{" "}
                        {listingPreviewQuery.data.model}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Ref: {listingPreviewQuery.data.referenceNumber}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Field orientation="vertical" data-invalid={!!form.formState.errors.message}>
              <FieldLabel htmlFor="message">Message</FieldLabel>
              <FieldContent>
                <Textarea
                  id="message"
                  placeholder="Optional"
                  disabled={isBusy}
                  {...form.register("message")}
                />
                <FieldError errors={[form.formState.errors.message]} />
              </FieldContent>
            </Field>
          </FieldGroup>

          <div className="space-y-3">
            <div className="text-sm font-medium">Files</div>

            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50",
                isBusy && "pointer-events-none opacity-60",
              )}
            >
              <Input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                accept={ALL_ALLOWED_MEDIA_MIME_TYPES.join(",")}
                onChange={(e) => {
                  addFiles(e.target.files);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              />

              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-muted p-4">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Drop files here</p>
                  <p className="text-muted-foreground text-xs">or</p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    Select Files
                  </Button>
                </div>
              </div>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <div className="text-muted-foreground text-xs">
                  {selectedFiles.length} file{selectedFiles.length === 1 ? "" : "s"} selected
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {selectedFiles.map((f, idx) => (
                    <div
                      key={`${f.file.name}-${idx}`}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded bg-muted">
                        {f.kind === "image" && f.previewUrl ? (
                          <img
                            src={f.previewUrl}
                            alt={f.file.name}
                            className="h-full w-full object-cover"
                          />
                        ) : f.kind === "video" ? (
                          <Video className="h-6 w-6 text-muted-foreground" />
                        ) : (
                          <FileText className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {f.kind === "image" ? (
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          ) : f.kind === "video" ? (
                            <Video className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div className="truncate text-sm font-medium">{f.file.name}</div>
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {Math.max(1, Math.round(f.file.size / 1024))} KB
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={isBusy}
                        onClick={() => removeFile(idx)}
                        aria-label={`Remove ${f.file.name}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {progressText && (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{progressText}</span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={!canClose}
              onClick={() => {
                if (!canClose) return;
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isBusy} aria-busy={isBusy}>
              {isBusy ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


