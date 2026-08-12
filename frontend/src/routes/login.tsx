import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { HeartPulse, Stethoscope, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/hms/feedback";
import { api, decodeJwt, setSession, type Role } from "@/lib/api";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — MediCare HMS" },
      { name: "description", content: "Log in to MediCare HMS as a doctor or a patient." },
      { property: "og:title", content: "Sign in — MediCare HMS" },
      { property: "og:description", content: "Doctor and patient login for MediCare HMS." },
    ],
  }),
  component: LoginPage,
});

function pickId(payload: Record<string, unknown> | null, data: Record<string, unknown>) {
  const keys = ["id", "userId", "doctorId", "patientId"];
  for (const k of keys) {
    const v = data[k] ?? payload?.[k];
    if (typeof v === "number" || (typeof v === "string" && v !== "")) return v;
  }
  return undefined;
}

function LoginForm({ role }: { role: Role }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const next: { email?: string; password?: string } = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "Enter a valid email address";
    if (password.length < 4) next.password = "Password must be at least 4 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const path = role === "DOCTOR" ? "/api/auth/doctor/login" : "/api/auth/patient/login";
      const raw = await api<unknown>(path, {
        method: "POST",
        auth: false,
        body: { email: email.trim(), emailId: email.trim(), password },
      });
      const data = (typeof raw === "object" && raw ? raw : {}) as Record<string, unknown>;
      const token = String(data["token"] ?? data["jwt"] ?? data["accessToken"] ?? raw ?? "");
      if (!token || token === "[object Object]") {
        throw new Error("Login succeeded but no token was returned by the server.");
      }
      const payload = decodeJwt(token);
      setSession({
        token,
        role,
        userId: pickId(payload, data),
        name: (data["name"] as string) ?? undefined,
        email: email.trim(),
      });
      toast.success(`Welcome back${role === "DOCTOR" ? ", doctor" : ""}!`);
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor={`${role}-email`}>Email</Label>
        <Input
          id={`${role}-email`}
          type="email"
          autoComplete="email"
          value={email}
          maxLength={255}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={role === "DOCTOR" ? "doctor@hospital.com" : "patient@gmail.com"}
        />
        {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${role}-password`}>Password</Label>
        <Input
          id={`${role}-password`}
          type="password"
          autoComplete="current-password"
          value={password}
          maxLength={100}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        {errors.password ? <p className="text-xs text-destructive">{errors.password}</p> : null}
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Spinner className="text-primary-foreground" /> : null}
        Login as {role === "DOCTOR" ? "Doctor" : "Patient"}
      </Button>
    </form>
  );
}

function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 rounded-2xl bg-primary p-3 shadow-card">
            <HeartPulse className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">MediCare HMS</h1>
          <p className="text-sm text-muted-foreground">Hospital Management System</p>
        </div>
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Choose your role and enter your credentials.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="DOCTOR">
              <TabsList className="mb-5 grid w-full grid-cols-2">
                <TabsTrigger value="DOCTOR">
                  <Stethoscope className="mr-2 h-4 w-4" /> Doctor
                </TabsTrigger>
                <TabsTrigger value="PATIENT">
                  <User className="mr-2 h-4 w-4" /> Patient
                </TabsTrigger>
              </TabsList>
              <TabsContent value="DOCTOR">
                <LoginForm role="DOCTOR" />
              </TabsContent>
              <TabsContent value="PATIENT">
                <LoginForm role="PATIENT" />
              </TabsContent>
            </Tabs>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              No account?{" "}
              <Link to="/register" className="font-semibold text-primary hover:underline">
                Register here
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
