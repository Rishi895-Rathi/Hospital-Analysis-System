import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Search, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { api, toList, totalPages as readTotalPages } from "@/lib/api";
import type { Patient } from "@/lib/types";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState, ErrorBlock, LoadingBlock } from "@/components/hms/feedback";
import { ConfirmDialog } from "@/components/hms/confirm-dialog";
import { Pager } from "@/components/hms/pager";

export const Route = createFileRoute("/patients")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Patient Management — MediCare HMS" },
      {
        name: "description",
        content: "Search, filter and manage patient records by name, disease and blood group.",
      },
      { property: "og:title", content: "Patient Management — MediCare HMS" },
      { property: "og:description", content: "Patient records, filters and details." },
    ],
  }),
  component: PatientsPage,
});

const SIZE = 10;
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

type Filter = { kind: "all" } | { kind: "name" | "disease" | "bloodGroup"; value: string };

function PatientsPage() {
  const { session, ready, allowed } = useRequireAuth("DOCTOR");
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [name, setName] = useState("");
  const [disease, setDisease] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [filter, setFilter] = useState<Filter>({ kind: "all" });
  const [viewing, setViewing] = useState<Patient | null>(null);
  const [deleting, setDeleting] = useState<Patient | null>(null);

  const query = useQuery({
    queryKey: ["patients", page, filter],
    queryFn: async () => {
      let raw: unknown;
      if (filter.kind === "name") raw = await api(`/api/patient/search/${encodeURIComponent(filter.value)}`);
      else if (filter.kind === "disease")
        raw = await api(`/api/patient/disease/${encodeURIComponent(filter.value)}`);
      else if (filter.kind === "bloodGroup")
        raw = await api(`/api/patient/bloodgroup/${encodeURIComponent(filter.value)}`);
      else raw = await api(`/api/patient/all?page=${page}&size=${SIZE}`);
      return { list: toList<Patient>(raw), pages: readTotalPages(raw, page + 1) };
    },
    enabled: allowed,
  });

  const removePatient = useMutation({
    mutationFn: (id: number) => api(`/api/patient/delete/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Patient deleted");
      setDeleting(null);
      qc.invalidateQueries({ queryKey: ["patients"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!ready || !session) return <LoadingBlock label="Loading patients..." />;
  if (!allowed) return <LoadingBlock label="Redirecting..." />;

  const patients = query.data?.list ?? [];

  const resetFilters = () => {
    setName("");
    setDisease("");
    setBloodGroup("");
    setPage(0);
    setFilter({ kind: "all" });
  };

  return (
    <AppLayout session={session} title="Patient Management" subtitle="All registered patients">
      <div className="space-y-5">
        <Card className="shadow-card">
          <CardContent className="grid gap-3 pt-6 md:grid-cols-4">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="f-name">Search by name</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="f-name"
                  className="pl-9"
                  value={name}
                  maxLength={100}
                  placeholder="Rahul"
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && name.trim())
                      setFilter({ kind: "name", value: name.trim() });
                  }}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-disease">Filter by disease</Label>
              <Input
                id="f-disease"
                value={disease}
                maxLength={80}
                placeholder="heart"
                onChange={(e) => setDisease(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && disease.trim())
                    setFilter({ kind: "disease", value: disease.trim() });
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-blood">Blood group</Label>
              <select
                id="f-blood"
                value={bloodGroup}
                onChange={(e) => {
                  setBloodGroup(e.target.value);
                  if (e.target.value) setFilter({ kind: "bloodGroup", value: e.target.value });
                  else setFilter({ kind: "all" });
                }}
                className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="">All</option>
                {bloodGroups.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-2 md:col-span-4">
              <Button
                onClick={() => {
                  if (name.trim()) setFilter({ kind: "name", value: name.trim() });
                  else if (disease.trim()) setFilter({ kind: "disease", value: disease.trim() });
                  else if (bloodGroup) setFilter({ kind: "bloodGroup", value: bloodGroup });
                  else setFilter({ kind: "all" });
                  setPage(0);
                }}
              >
                Apply
              </Button>
              {filter.kind !== "all" ? (
                <Button variant="outline" onClick={resetFilters}>
                  Reset
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {query.isLoading ? (
          <LoadingBlock />
        ) : query.isError ? (
          <ErrorBlock message={(query.error as Error).message} />
        ) : patients.length === 0 ? (
          <EmptyState
            title="No patients found"
            description="Adjust your filters or wait for new registrations."
            icon={Users}
          />
        ) : (
          <Card className="shadow-card">
            <CardContent className="overflow-x-auto pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Age</TableHead>
                    <TableHead className="hidden md:table-cell">Disease</TableHead>
                    <TableHead className="hidden md:table-cell">Blood</TableHead>
                    <TableHead className="hidden lg:table-cell">Phone</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="hidden sm:table-cell">{p.age ?? "—"}</TableCell>
                      <TableCell className="hidden md:table-cell">{p.disease ?? "—"}</TableCell>
                      <TableCell className="hidden md:table-cell">{p.bloodGroup ?? "—"}</TableCell>
                      <TableCell className="hidden lg:table-cell">{p.phone ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setViewing(p)}>
                            <Eye className="h-3.5 w-3.5" /> View
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => setDeleting(p)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filter.kind === "all" ? (
                <Pager page={page} totalPages={query.data?.pages ?? 1} onChange={setPage} />
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{viewing?.name}</DialogTitle>
            <DialogDescription>Patient details</DialogDescription>
          </DialogHeader>
          <dl className="space-y-2 text-sm">
            {[
              ["Age", viewing?.age],
              ["Email", viewing?.email],
              ["Phone", viewing?.phone],
              ["Disease", viewing?.disease],
              ["Blood group", viewing?.bloodGroup],
              ["Address", viewing?.address],
            ].map(([k, v]) => (
              <div key={String(k)} className="flex justify-between gap-4 border-b pb-1.5">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium text-foreground">{v ?? "—"}</dd>
              </div>
            ))}
          </dl>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.name ?? "patient"}?`}
        description="This permanently removes the patient record and cannot be undone."
        onConfirm={() => deleting && removePatient.mutate(deleting.id)}
      />
    </AppLayout>
  );
}
