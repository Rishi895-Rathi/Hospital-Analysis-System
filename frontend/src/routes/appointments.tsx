import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Check, X } from "lucide-react";
import { toast } from "sonner";
import { api, toList } from "@/lib/api";
import type { Appointment } from "@/lib/types";
import { useRequireAuth } from "@/lib/useAuth";
import { AppLayout } from "@/components/hms/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState, ErrorBlock, LoadingBlock } from "@/components/hms/feedback";
import { StatusBadge } from "@/components/hms/badges";

export const Route = createFileRoute("/appointments")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Appointments — MediCare HMS" },
      {
        name: "description",
        content: "Track appointment status, confirm or cancel hospital bookings.",
      },
      { property: "og:title", content: "Appointments — MediCare HMS" },
      { property: "og:description", content: "Appointment schedule and status management." },
    ],
  }),
  component: AppointmentsPage,
});

function AppointmentsPage() {
  const { session, ready } = useRequireAuth();
  const qc = useQueryClient();
  const isDoctor = session?.role === "DOCTOR";
  const userId = session?.userId;

  const query = useQuery({
    queryKey: ["appointments", session?.role, userId ?? "all"],
    queryFn: async () => {
      const path = isDoctor
        ? "/api/appointment/all"
        : userId
          ? `/api/appointment/patient/${userId}`
          : "/api/appointment/all";
      return toList<Appointment>(await api(path));
    },
    enabled: !!session,
  });

  const update = useMutation({
    mutationFn: ({ id, action }: { id: number; action: "confirm" | "cancel" }) =>
      api(`/api/appointment/${action}/${id}`, { method: "PUT" }),
    onSuccess: (_d, v) => {
      toast.success(v.action === "confirm" ? "Appointment confirmed" : "Appointment cancelled");
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!ready || !session) return <LoadingBlock label="Loading appointments..." />;

  const list = query.data ?? [];

  return (
    <AppLayout
      session={session}
      title={isDoctor ? "All Appointments" : "My Appointments"}
      subtitle={isDoctor ? "Confirm or cancel patient bookings" : "Your booking history"}
    >
      {query.isLoading ? (
        <LoadingBlock />
      ) : query.isError ? (
        <ErrorBlock message={(query.error as Error).message} />
      ) : list.length === 0 ? (
        <EmptyState
          title="No appointments"
          description="Appointments will show up here once booked."
          icon={CalendarDays}
        />
      ) : (
        <Card className="shadow-card">
          <CardContent className="overflow-x-auto pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead className="hidden sm:table-cell">Doctor</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="hidden md:table-cell">Time</TableHead>
                  <TableHead className="hidden lg:table-cell">Reason</TableHead>
                  <TableHead>Status</TableHead>
                  {isDoctor ? <TableHead className="text-right">Actions</TableHead> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-muted-foreground">{a.id}</TableCell>
                    <TableCell className="font-medium">
                      {a.patientName ?? `#${a.patientId ?? "-"}`}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {a.doctorName ?? `#${a.doctorId ?? "-"}`}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {a.appointmentDate ?? "—"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {a.appointmentTime ?? "—"}
                    </TableCell>
                    <TableCell className="hidden max-w-[220px] truncate lg:table-cell">
                      {a.reason ?? "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={a.status} />
                    </TableCell>
                    {isDoctor ? (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={update.isPending}
                            onClick={() => update.mutate({ id: a.id, action: "confirm" })}
                          >
                            <Check className="h-3.5 w-3.5 text-success" /> Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={update.isPending}
                            onClick={() => update.mutate({ id: a.id, action: "cancel" })}
                          >
                            <X className="h-3.5 w-3.5 text-destructive" /> Cancel
                          </Button>
                        </div>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
