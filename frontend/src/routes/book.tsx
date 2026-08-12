import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { api, toList } from "@/lib/api";
import type { Doctor } from "@/lib/types";
import { useRequireAuth } from "@/lib/useAuth";
import { AppLayout } from "@/components/hms/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EmptyState, LoadingBlock, Spinner } from "@/components/hms/feedback";

export const Route = createFileRoute("/book")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Book an Appointment — MediCare HMS" },
      {
        name: "description",
        content: "Describe the condition, get suggested specialists and book an appointment.",
      },
      { property: "og:title", content: "Book an Appointment — MediCare HMS" },
      { property: "og:description", content: "Find the right doctor and reserve a slot." },
    ],
  }),
  component: BookPage,
});

const steps = ["Disease", "Doctor", "Schedule"];

function BookPage() {
  const { session, ready } = useRequireAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [disease, setDisease] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selected, setSelected] = useState<Doctor | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [patientId, setPatientId] = useState("");

  const suggest = useMutation({
    mutationFn: async () =>
      toList<Doctor>(
        await api(`/api/appointment/suggest-doctors/${encodeURIComponent(disease.trim())}`),
      ),
    onSuccess: (list) => {
      setDoctors(list);
      setStep(1);
      if (list.length === 0) toast.info("No doctors matched that condition.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const book = useMutation({
    mutationFn: async () => {
      const pid = session?.role === "PATIENT" ? (session.userId ?? patientId) : patientId;
      await api("/api/appointment/book", {
        method: "POST",
        body: {
          patientId: Number(pid),
          doctorId: selected?.id,
          appointmentDate: date,
          appointmentTime: time.length === 5 ? `${time}:00` : time,
          reason: reason.trim(),
        },
      });
    },
    onSuccess: () => {
      toast.success("Appointment booked successfully");
      navigate({ to: "/appointments" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!ready || !session) return <LoadingBlock label="Loading..." />;

  const needsPatientId = session.role === "DOCTOR" || !session.userId;
  const scheduleValid =
    !!selected && !!date && !!time && reason.trim().length > 2 && (!needsPatientId || !!patientId);

  return (
    <AppLayout session={session} title="Book Appointment" subtitle="Three quick steps">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          {steps.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-3">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                  i <= step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:inline",
                  i <= step ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
              {i < steps.length - 1 ? <div className="h-px flex-1 bg-border" /> : null}
            </div>
          ))}
        </div>

        {step === 0 ? (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>What is the condition?</CardTitle>
              <CardDescription>We suggest specialists based on the disease.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="disease">Disease / symptom</Label>
                <Input
                  id="disease"
                  value={disease}
                  maxLength={80}
                  placeholder="heart"
                  onChange={(e) => setDisease(e.target.value)}
                />
              </div>
              <Button
                disabled={disease.trim().length < 2 || suggest.isPending}
                onClick={() => suggest.mutate()}
              >
                {suggest.isPending ? <Spinner className="text-primary-foreground" /> : null}
                Find doctors
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {step === 1 ? (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Select a doctor</CardTitle>
              <CardDescription>Suggested for &ldquo;{disease}&rdquo;</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {doctors.length === 0 ? (
                <EmptyState
                  title="No doctors available"
                  description="Try a different condition keyword."
                  icon={Stethoscope}
                  action={
                    <Button size="sm" variant="outline" onClick={() => setStep(0)}>
                      Back
                    </Button>
                  }
                />
              ) : (
                <>
                  {doctors.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setSelected(d);
                        setStep(2);
                      }}
                      className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:border-primary hover:bg-accent"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{d.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {d.specialization ?? "General"} · {d.department ?? "—"}
                        </p>
                      </div>
                      <Badge
                        className={
                          d.available === false
                            ? "bg-destructive/10 text-destructive"
                            : "bg-success/15 text-success"
                        }
                      >
                        {d.available === false ? "On leave" : "Available"}
                      </Badge>
                    </button>
                  ))}
                  <Button variant="outline" onClick={() => setStep(0)}>
                    Back
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : null}

        {step === 2 ? (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Appointment details</CardTitle>
              <CardDescription>With {selected?.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {needsPatientId ? (
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="pid">Patient ID</Label>
                    <Input
                      id="pid"
                      inputMode="numeric"
                      value={patientId}
                      maxLength={9}
                      placeholder="1"
                      onChange={(e) => setPatientId(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                ) : null}
                <div className="space-y-1.5">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  maxLength={300}
                  placeholder="Heart checkup"
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button disabled={!scheduleValid || book.isPending} onClick={() => book.mutate()}>
                  {book.isPending ? <Spinner className="text-primary-foreground" /> : null}
                  Confirm booking
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AppLayout>
  );
}
