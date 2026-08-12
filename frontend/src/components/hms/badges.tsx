import { cn } from "@/lib/utils";
import type { AppointmentStatus, PaymentStatus } from "@/lib/types";

const appointmentStyles: Record<AppointmentStatus, string> = {
  PENDING: "bg-warning/15 text-warning-foreground border-warning/40",
  CONFIRMED: "bg-success/15 text-success border-success/40",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/40",
  POSTPONED: "bg-chart-3/20 text-warning-foreground border-chart-3/50",
  COMPLETED: "bg-info/15 text-info border-info/40",
};

export function StatusBadge({ status }: { status?: string | undefined }) {
  const key = (status ?? "PENDING").toUpperCase() as AppointmentStatus;
  const style = appointmentStyles[key] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        style,
      )}
    >
      {key}
    </span>
  );
}

const paymentStyles: Record<PaymentStatus, string> = {
  PAID: "bg-success/15 text-success border-success/40",
  PARTIAL: "bg-warning/15 text-warning-foreground border-warning/40",
  PENDING: "bg-destructive/10 text-destructive border-destructive/40",
};

export function PaymentBadge({ status }: { status?: string | undefined }) {
  const key = (status ?? "PENDING").toUpperCase() as PaymentStatus;
  const style = paymentStyles[key] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        style,
      )}
    >
      {key}
    </span>
  );
}
