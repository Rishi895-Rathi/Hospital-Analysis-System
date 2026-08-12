import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, CalendarPlus, Users, Stethoscope, Receipt, UserRound } from "lucide-react";
import { api, toList } from "@/lib/api";
import type { Appointment, Patient } from "@/lib/types";
import { useRequireAuth } from "@/lib/useAuth";
import { AppLayout } from "@/components/hms/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorBlock, LoadingBlock } from "@/components/hms/feedback";
import { StatusBadge } from "@/components/hms/badges";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Dashboard — MediCare HMS" },
      { name: "description", content: "Overview of patients, appointments and hospital activity." },
      { property: "og:title", content: "Dashboard — MediCare HMS" },
      { property: "og:description", content: "Your MediCare HMS activity at a glance." },
    ],
  }),
  component: DashboardPage,
});

function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "primary" | "success" | "warning";
}) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning-foreground",
  } as const;
  return (
    <Card className="shadow-card">
      <CardContent className="flex items-center gap-4 pt-6">
        <div className={`rounded-xl p-3 ${tones[tone]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AppointmentRow({ a, showPatient }: { a: Appointment; showPatient: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">
          {showPatient
            ? (a.patientName ?? `Patient #${a.patientId ?? "-"}`)
            : (a.doctorName ?? `Doctor #${a.doctorId ?? "-"}`)}
        </p>
        <p className="text-xs text-muted-foreground">
          {a.appointmentDate ?? "—"} at {a.appointmentTime ?? "—"}
          {a.reason ? ` · ${a.reason}` : ""}
        </p>
      </div>
      <StatusBadge status={a.status} />
    </div>
  );
}

function DoctorDashboard() {
  const patients = useQuery({
    queryKey: ["patients", "all", 0],
    queryFn: async () => toList<Patient>(await api("/api/patient/all?page=0&size=100")),
  });
  const appointments = useQuery({
    queryKey: ["appointments", "all"],
    queryFn: async () => toList<Appointment>(await api("/api/appointment/all")),
  });

  const list = appointments.data ?? [];
  const pending = list.filter((a) => (a.status ?? "PENDING") === "PENDING").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total patients"
          value={patients.isLoading ? "…" : (patients.data?.length ?? 0)}
          icon={Users}
        />
        <StatCard
          label="Total appointments"
          value={appointments.isLoading ? "…" : list.length}
          icon={CalendarDays}
          tone="success"
        />
        <StatCard
          label="Pending approvals"
          value={appointments.isLoading ? "…" : pending}
          icon={CalendarPlus}
          tone="warning"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: "/doctors", label: "Manage doctors", icon: Stethoscope },
          { to: "/patients", label: "Manage patients", icon: Users },
          { to: "/appointments", label: "Appointments", icon: CalendarDays },
          { to: "/billing", label: "Billing", icon: Receipt },
        ].map((q) => (
          <Link key={q.to} to={q.to}>
            <Card className="h-full transition-shadow hover:shadow-card">
              <CardContent className="flex items-center gap-3 pt-6">
                <q.icon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-foreground">{q.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Recent appointments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {appointments.isLoading ? (
            <LoadingBlock />
          ) : appointments.isError ? (
            <ErrorBlock message={(appointments.error as Error).message} />
          ) : list.length === 0 ? (
            <EmptyState
              title="No appointments yet"
              description="New bookings will appear here."
              icon={CalendarDays}
            />
          ) : (
            list
              .slice(-6)
              .reverse()
              .map((a) => <AppointmentRow key={a.id} a={a} showPatient />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PatientDashboard({ patientId, email }: { patientId?: string | number | undefined; email?: string | undefined }) {
  const appointments = useQuery({
    queryKey: ["appointments", "patient", patientId ?? "me"],
    queryFn: async () =>
      toList<Appointment>(
        await api(patientId ? `/api/appointment/patient/${patientId}` : "/api/appointment/all"),
      ),
  });
  const profile = useQuery({
    queryKey: ["patient", patientId],
    queryFn: async () => (await api(`/api/patient/${patientId}`)) as Patient,
    enabled: !!patientId,
  });

  const list = appointments.data ?? [];
  const upcoming = list.filter((a) => (a.status ?? "") !== "CANCELLED").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="My appointments"
          value={appointments.isLoading ? "…" : list.length}
          icon={CalendarDays}
        />
        <StatCard label="Active bookings" value={upcoming} icon={CalendarPlus} tone="success" />
        <Card className="shadow-card">
          <CardContent className="flex h-full flex-col justify-center gap-3 pt-6">
            <p className="text-sm text-muted-foreground">Need to see a doctor?</p>
            <Button asChild>
              <Link to="/book">
                <CalendarPlus className="h-4 w-4" /> Book new appointment
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle>My appointments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {appointments.isLoading ? (
              <LoadingBlock />
            ) : appointments.isError ? (
              <ErrorBlock message={(appointments.error as Error).message} />
            ) : list.length === 0 ? (
              <EmptyState
                title="No appointments yet"
                description="Book your first appointment to get started."
                icon={CalendarDays}
                action={
                  <Button asChild size="sm">
                    <Link to="/book">Book appointment</Link>
                  </Button>
                }
              />
            ) : (
              list.map((a) => <AppointmentRow key={a.id} a={a} showPatient={false} />)
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-primary" /> My profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {profile.isLoading ? (
              <LoadingBlock label="Loading profile..." />
            ) : profile.data ? (
              <dl className="space-y-2">
                {[
                  ["Name", profile.data.name],
                  ["Age", profile.data.age],
                  ["Email", profile.data.email],
                  ["Phone", profile.data.phone],
                  ["Disease", profile.data.disease],
                  ["Blood group", profile.data.bloodGroup],
                  ["Address", profile.data.address],
                ].map(([k, v]) => (
                  <div key={String(k)} className="flex justify-between gap-3 border-b pb-1">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="truncate font-medium text-foreground">{v ?? "—"}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-muted-foreground">Signed in as {email ?? "patient"}.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardPage() {
  const { session, ready } = useRequireAuth();
  if (!ready || !session) return <LoadingBlock label="Loading dashboard..." />;

  return (
    <AppLayout
      session={session}
      title={session.role === "DOCTOR" ? "Doctor Dashboard" : "Patient Dashboard"}
      subtitle={
        session.role === "DOCTOR"
          ? "Hospital activity overview"
          : "Your appointments and health profile"
      }
    >
      {session.role === "DOCTOR" ? (
        <DoctorDashboard />
      ) : (
        <PatientDashboard patientId={session.userId} email={session.email} />
      )}
    </AppLayout>
  );
}
