import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Receipt, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, toList } from "@/lib/api";
import type { Billing, PaymentMethod, PaymentStatus } from "@/lib/types";
import { useRequireAuth } from "@/lib/useAuth";
import { AppLayout } from "@/components/hms/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState, ErrorBlock, LoadingBlock, Spinner } from "@/components/hms/feedback";
import { PaymentBadge } from "@/components/hms/badges";
import { ConfirmDialog } from "@/components/hms/confirm-dialog";

export const Route = createFileRoute("/billing")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Billing — MediCare HMS" },
      {
        name: "description",
        content: "Create and track hospital invoices, payment methods and outstanding balances.",
      },
      { property: "og:title", content: "Billing — MediCare HMS" },
      { property: "og:description", content: "Invoices, payment status and collection tracking." },
    ],
  }),
  component: BillingPage,
});

const methods: PaymentMethod[] = ["CASH", "CARD", "UPI"];
const statuses: PaymentStatus[] = ["PAID", "PARTIAL", "PENDING"];

const selectClass =
  "h-9 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50";

function computeStatus(total: number, paid: number): PaymentStatus {
  if (paid >= total && total > 0) return "PAID";
  if (paid > 0) return "PARTIAL";
  return "PENDING";
}

function BillingPage() {
  const { session, ready, allowed } = useRequireAuth("DOCTOR");
  const qc = useQueryClient();
  const [status, setStatus] = useState("");
  const [method, setMethod] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [deleting, setDeleting] = useState<Billing | null>(null);

  const query = useQuery({
    queryKey: ["billings", status, method],
    queryFn: async () => {
      const path = status
        ? `/api/billing/status/${status}`
        : method
          ? `/api/billing/method/${method}`
          : "/api/billing/all";
      return toList<Billing>(await api(path));
    },
    enabled: allowed,
  });

  const removeBilling = useMutation({
    mutationFn: (patientId: number) =>
      api(`/api/billing/delete/${patientId}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Billing deleted");
      setDeleting(null);
      qc.invalidateQueries({ queryKey: ["billings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!ready || !session) return <LoadingBlock label="Loading billing..." />;
  if (!allowed) return <LoadingBlock label="Redirecting..." />;

  const list = query.data ?? [];

  return (
    <AppLayout session={session} title="Billing Management" subtitle="Invoices and payments">
      <div className="space-y-5">
        <Card className="shadow-card">
          <CardContent className="grid gap-3 pt-6 md:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="b-status">Payment status</Label>
              <select
                id="b-status"
                className={selectClass}
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  if (e.target.value) setMethod("");
                }}
              >
                <option value="">All</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="b-method">Payment method</Label>
              <select
                id="b-method"
                className={selectClass}
                value={method}
                onChange={(e) => {
                  setMethod(e.target.value);
                  if (e.target.value) setStatus("");
                }}
              >
                <option value="">All</option>
                {methods.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2 md:col-span-2">
              <Button onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4" /> Add billing
              </Button>
              {status || method ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatus("");
                    setMethod("");
                  }}
                >
                  Reset filters
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {query.isLoading ? (
          <LoadingBlock />
        ) : query.isError ? (
          <ErrorBlock message={(query.error as Error).message} />
        ) : list.length === 0 ? (
          <EmptyState
            title="No billing records"
            description="Create an invoice to start tracking payments."
            icon={Receipt}
            action={
              <Button size="sm" onClick={() => setAddOpen(true)}>
                Add billing
              </Button>
            }
          />
        ) : (
          <Card className="shadow-card">
            <CardContent className="overflow-x-auto pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead className="hidden sm:table-cell">Due</TableHead>
                    <TableHead className="hidden md:table-cell">Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((b, i) => {
                    const total = Number(b.totalAmount ?? 0);
                    const paid = Number(b.paidAmount ?? 0);
                    return (
                      <TableRow key={b.id ?? `${b.patientName}-${i}`}>
                        <TableCell className="font-medium">{b.patientName}</TableCell>
                        <TableCell>₹{total.toLocaleString()}</TableCell>
                        <TableCell>₹{paid.toLocaleString()}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          ₹{Math.max(total - paid, 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{b.paymentMethod}</TableCell>
                        <TableCell>
                          <PaymentBadge status={b.paymentStatus ?? computeStatus(total, paid)} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={!b.patientId && !b.id}
                            onClick={() => setDeleting(b)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <AddBillingDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSaved={() => qc.invalidateQueries({ queryKey: ["billings"] })}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete billing for ${deleting?.patientName ?? "patient"}?`}
        description="This permanently removes the invoice record."
        onConfirm={() => {
          const id = deleting?.patientId ?? deleting?.id;
          if (id) removeBilling.mutate(Number(id));
        }}
      />
    </AppLayout>
  );
}

function AddBillingDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [patientName, setPatientName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");

  const total = Number(totalAmount || 0);
  const paid = Number(paidAmount || 0);
  const valid = patientName.trim().length > 1 && total > 0 && paid >= 0 && paid <= total;

  const save = useMutation({
    mutationFn: () =>
      api("/api/billing/add", {
        method: "POST",
        body: {
          patientName: patientName.trim(),
          totalAmount: total,
          paidAmount: paid,
          paymentMethod,
        },
      }),
    onSuccess: () => {
      toast.success("Billing added");
      setPatientName("");
      setTotalAmount("");
      setPaidAmount("");
      setPaymentMethod("CASH");
      onSaved();
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add billing</DialogTitle>
          <DialogDescription>
            Payment status is calculated automatically from the amounts.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="bp-name">Patient name</Label>
            <Input
              id="bp-name"
              value={patientName}
              maxLength={100}
              placeholder="Rahul Kumar"
              onChange={(e) => setPatientName(e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="bp-total">Total amount</Label>
              <Input
                id="bp-total"
                inputMode="numeric"
                value={totalAmount}
                maxLength={9}
                onChange={(e) => setTotalAmount(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bp-paid">Paid amount</Label>
              <Input
                id="bp-paid"
                inputMode="numeric"
                value={paidAmount}
                maxLength={9}
                onChange={(e) => setPaidAmount(e.target.value.replace(/\D/g, ""))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bp-method">Payment method</Label>
            <select
              id="bp-method"
              className={selectClass}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            >
              {methods.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm">
            <span className="text-muted-foreground">Calculated status</span>
            <PaymentBadge status={computeStatus(total, paid)} />
          </div>
          {!valid ? (
            <p className="text-xs text-destructive">
              Enter a patient name, a total above zero, and a paid amount no greater than the total.
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!valid || save.isPending} onClick={() => save.mutate()}>
            {save.isPending ? <Spinner className="text-primary-foreground" /> : null}
            Save billing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
