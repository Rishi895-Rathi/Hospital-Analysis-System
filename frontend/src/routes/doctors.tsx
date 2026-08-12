import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarOff, Pencil, Search, Stethoscope, Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { api, toList, totalPages as readTotalPages } from "@/lib/api";
import type { Doctor } from "@/lib/types";
import { useRequireAuth } from "@/lib/useAuth";
import { AppLayout } from "@/components/hms/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState, ErrorBlock, LoadingBlock, Spinner } from "@/components/hms/feedback";
import { ConfirmDialog } from "@/components/hms/confirm-dialog";
import { Pager } from "@/components/hms/pager";

export const Route = createFileRoute("/doctors")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Doctor Management — MediCare HMS" },
      {
        name: "description",
        content: "Browse, update, and manage hospital doctors, leaves and availability.",
      },
      { property: "og:title", content: "Doctor Management — MediCare HMS" },
      { property: "og:description", content: "Manage doctors, specializations and leave schedules." },
    ],
  }),
  component: DoctorsPage,
});

const SIZE = 10;

function DoctorsPage() {
  const { session, ready, allowed } = useRequireAuth("DOCTOR");
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [specialization, setSpecialization] = useState("");
  const [activeSpec, setActiveSpec] = useState("");
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [leaveFor, setLeaveFor] = useState<Doctor | null>(null);
  const [deleting, setDeleting] = useState<Doctor | null>(null);

  const query = useQuery({
    queryKey: ["doctors", page, activeSpec],
    queryFn: async () => {
      const raw = activeSpec
        ? await api(`/api/doctor/specialization/${encodeURIComponent(activeSpec)}`)
        : await api(`/api/doctor/all?page=${page}&size=${SIZE}`);
      return { list: toList<Doctor>(raw), pages: readTotalPages(raw, page + 1) };
    },
    enabled: allowed,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["doctors"] });

  const removeDoctor = useMutation({
    mutationFn: (id: number) => api(`/api/doctor/delete/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Doctor deleted");
      setDeleting(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const returnFromLeave = useMutation({
    mutationFn: (id: number) => api(`/api/doctor/return/${id}`, { method: "PUT" }),
    onSuccess: () => {
      toast.success("Doctor is back from leave");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!ready || !session) return <LoadingBlock label="Loading doctors..." />;
  if (!allowed) return <LoadingBlock label="Redirecting..." />;

  const doctors = query.data?.list ?? [];

  return (
    <AppLayout session={session} title="Doctor Management" subtitle="All registered doctors">
      <div className="space-y-5">
        <Card className="shadow-card">
          <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={specialization}
                maxLength={80}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="Search by specialization (e.g. Cardiology)"
                className="pl-9"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setPage(0);
                    setActiveSpec(specialization.trim());
                  }
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setPage(0);
                  setActiveSpec(specialization.trim());
                }}
              >
                Search
              </Button>
              {activeSpec ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSpecialization("");
                    setActiveSpec("");
                    setPage(0);
                  }}
                >
                  Clear
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {query.isLoading ? (
          <LoadingBlock />
        ) : query.isError ? (
          <ErrorBlock message={(query.error as Error).message} />
        ) : doctors.length === 0 ? (
          <EmptyState
            title="No doctors found"
            description="Try a different specialization or add a doctor from the register page."
            icon={Stethoscope}
          />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {doctors.map((d) => (
                <Card key={d.id} className="shadow-card">
                  <CardContent className="space-y-3 pt-6">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{d.name}</p>
                        <p className="truncate text-sm text-muted-foreground">{d.emailId}</p>
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
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>
                        <span className="font-medium text-foreground">Specialization:</span>{" "}
                        {d.specialization ?? "—"}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Department:</span>{" "}
                        {d.department ?? "—"}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Contact:</span>{" "}
                        {d.contactNumber ?? "—"}
                      </p>
                      {d.bio ? <p className="line-clamp-2">{d.bio}</p> : null}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button size="sm" variant="outline" onClick={() => setEditing(d)}>
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setLeaveFor(d)}>
                        <CalendarOff className="h-3.5 w-3.5" /> Apply leave
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={returnFromLeave.isPending}
                        onClick={() => returnFromLeave.mutate(d.id)}
                      >
                        <Undo2 className="h-3.5 w-3.5" /> Return
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setDeleting(d)}>
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {!activeSpec ? (
              <Pager page={page} totalPages={query.data?.pages ?? 1} onChange={setPage} />
            ) : null}
          </>
        )}
      </div>

      <EditDoctorDialog doctor={editing} onClose={() => setEditing(null)} onSaved={invalidate} />
      <LeaveDialog doctor={leaveFor} onClose={() => setLeaveFor(null)} onSaved={invalidate} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.name ?? "doctor"}?`}
        description="This permanently removes the doctor record and cannot be undone."
        onConfirm={() => deleting && removeDoctor.mutate(deleting.id)}
      />
    </AppLayout>
  );
}

function EditDoctorDialog({
  doctor,
  onClose,
  onSaved,
}: {
  doctor: Doctor | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    emailId: "",
    contactNumber: "",
    specialization: "",
    department: "",
    bio: "",
  });
  const [loadedId, setLoadedId] = useState<number | null>(null);

  if (doctor && loadedId !== doctor.id) {
    setLoadedId(doctor.id);
    setForm({
      name: doctor.name ?? "",
      emailId: doctor.emailId ?? "",
      contactNumber: String(doctor.contactNumber ?? ""),
      specialization: doctor.specialization ?? "",
      department: doctor.department ?? "",
      bio: doctor.bio ?? "",
    });
  }

  const save = useMutation({
    mutationFn: async () => {
      if (!doctor) return;
      await api(`/api/doctor/update/${doctor.id}`, {
        method: "PUT",
        body: {
          name: form.name.trim(),
          emailId: form.emailId.trim(),
          contactNumber: Number(form.contactNumber) || 0,
          specialization: form.specialization.trim(),
          department: form.department.trim(),
          bio: form.bio.trim(),
          available: doctor.available ?? true,
        },
      });
    },
    onSuccess: () => {
      toast.success("Doctor updated");
      onSaved();
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const valid = form.name.trim().length > 1 && /^\S+@\S+\.\S+$/.test(form.emailId.trim());

  return (
    <Dialog open={!!doctor} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Update doctor profile</DialogTitle>
          <DialogDescription>Edit the details and save your changes.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["name", "Name"],
              ["emailId", "Email"],
              ["contactNumber", "Contact number"],
              ["specialization", "Specialization"],
              ["department", "Department"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={`e-${key}`}>{label}</Label>
              <Input
                id={`e-${key}`}
                value={form[key]}
                maxLength={255}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="e-bio">Bio</Label>
          <Textarea
            id="e-bio"
            value={form.bio}
            maxLength={500}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
          />
        </div>
        {!valid ? (
          <p className="text-xs text-destructive">A valid name and email are required.</p>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!valid || save.isPending} onClick={() => save.mutate()}>
            {save.isPending ? <Spinner className="text-primary-foreground" /> : null}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LeaveDialog({
  doctor,
  onClose,
  onSaved,
}: {
  doctor: Doctor | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [postponeDays, setPostponeDays] = useState("7");

  const apply = useMutation({
    mutationFn: async () => {
      if (!doctor) return;
      await api(`/api/doctor/leave/${doctor.id}`, {
        method: "PUT",
        body: {
          leaveStartDate: start,
          leaveEndDate: end,
          postponeDays: Number(postponeDays) || 0,
        },
      });
    },
    onSuccess: () => {
      toast.success("Leave applied");
      onSaved();
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const valid = !!start && !!end && end >= start;

  return (
    <Dialog open={!!doctor} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Apply leave</DialogTitle>
          <DialogDescription>
            Appointments in this window are postponed for {doctor?.name ?? "this doctor"}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="l-start">Start date</Label>
            <Input id="l-start" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="l-end">End date</Label>
            <Input id="l-end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="l-days">Postpone days</Label>
            <Input
              id="l-days"
              inputMode="numeric"
              value={postponeDays}
              maxLength={3}
              onChange={(e) => setPostponeDays(e.target.value.replace(/\D/g, ""))}
            />
          </div>
        </div>
        {!valid ? (
          <p className="text-xs text-destructive">Pick a start and end date (end after start).</p>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!valid || apply.isPending} onClick={() => apply.mutate()}>
            {apply.isPending ? <Spinner className="text-primary-foreground" /> : null}
            Apply leave
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
