import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string | undefined }) {
  return <Loader2 className={cn("h-5 w-5 animate-spin text-primary", className)} />;
}

export function LoadingBlock({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
      <Spinner className="h-7 w-7" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
}: {
  title: string;
  description?: string | undefined;
  icon?: React.ComponentType<{ className?: string }> | undefined;
  action?: React.ReactNode | undefined;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
      {Icon ? (
        <div className="mb-2 rounded-full bg-accent p-3">
          <Icon className="h-6 w-6 text-accent-foreground" />
        </div>
      ) : null}
      <p className="font-medium text-foreground">{title}</p>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export function ErrorBlock({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      {message}
    </div>
  );
}
