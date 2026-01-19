import { Badge } from "@/components/ui/badge";

export type UploadStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

const statusConfig: Record<
  UploadStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }
> = {
  PENDING: {
    label: "Pending",
    variant: "secondary",
    className: "bg-amber-100 text-amber-900 border-amber-200",
  },
  APPROVED: { label: "Approved", variant: "default", className: "bg-emerald-600 text-white" },
  REJECTED: { label: "Rejected", variant: "destructive" },
  CANCELLED: { label: "Cancelled", variant: "outline" },
};

export function UploadStatusBadge({ status }: { status: UploadStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}

