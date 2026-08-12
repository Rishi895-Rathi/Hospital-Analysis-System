import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useSession } from "@/lib/useAuth";
import { LoadingBlock } from "@/components/hms/feedback";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "MediCare HMS — Hospital Management System" },
      {
        name: "description",
        content:
          "Manage doctors, patients, appointments and billing in one hospital management dashboard.",
      },
      { property: "og:title", content: "MediCare HMS — Hospital Management System" },
      {
        property: "og:description",
        content: "Doctor and patient portal for appointments, records and billing.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { session, ready } = useSession();
  if (!ready) return <LoadingBlock label="Starting MediCare HMS..." />;
  return <Navigate to={session ? "/dashboard" : "/login"} replace />;
}
