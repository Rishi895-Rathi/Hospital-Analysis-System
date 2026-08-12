import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  CalendarDays,
  CalendarPlus,
  Receipt,
  LogOut,
  Menu,
  HeartPulse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { clearSession, type Session } from "@/lib/api";
import { toast } from "sonner";

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };

const doctorNav: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/doctors", label: "Doctors", icon: Stethoscope },
  { to: "/patients", label: "Patients", icon: Users },
  { to: "/appointments", label: "Appointments", icon: CalendarDays },
  { to: "/book", label: "Book Appointment", icon: CalendarPlus },
  { to: "/billing", label: "Billing", icon: Receipt },
];

const patientNav: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/appointments", label: "My Appointments", icon: CalendarDays },
  { to: "/book", label: "Book Appointment", icon: CalendarPlus },
];

function NavLinks({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2 px-1 pb-6 pt-1">
      <div className="rounded-lg bg-primary p-2">
        <HeartPulse className="h-5 w-5 text-primary-foreground" />
      </div>
      <div>
        <p className="text-sm font-bold leading-tight text-foreground">MediCare HMS</p>
        <p className="text-xs text-muted-foreground">Hospital Management</p>
      </div>
    </div>
  );
}

export function AppLayout({
  session,
  title,
  subtitle,
  children,
}: {
  session: Session;
  title: string;
  subtitle?: string | undefined;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = session.role === "DOCTOR" ? doctorNav : patientNav;

  const logout = () => {
    clearSession();
    toast.success("Logged out");
    navigate({ to: "/login", replace: true });
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar p-4 lg:flex">
        <Brand />
        <NavLinks items={items} />
        <div className="mt-auto space-y-3 border-t border-sidebar-border pt-4">
          <div className="rounded-lg bg-accent px-3 py-2">
            <p className="truncate text-sm font-semibold text-accent-foreground">
              {session.name ?? session.email ?? "Signed in"}
            </p>
            <p className="text-xs text-muted-foreground">{session.role}</p>
          </div>
          <Button variant="outline" className="w-full justify-start" onClick={logout}>
            <LogOut className="h-4 w-4" /> Log out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur md:px-8">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-4">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Brand />
              <NavLinks items={items} onNavigate={() => setMobileOpen(false)} />
              <Button variant="outline" className="mt-6 w-full justify-start" onClick={logout}>
                <LogOut className="h-4 w-4" /> Log out
              </Button>
            </SheetContent>
          </Sheet>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-foreground md:text-xl">{title}</h1>
            {subtitle ? (
              <p className="truncate text-xs text-muted-foreground md:text-sm">{subtitle}</p>
            ) : null}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
