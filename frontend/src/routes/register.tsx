import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { HeartPulse } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/hms/feedback";
import { api } from "@/lib/api";

export const Route = createFileRoute("/register")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Create an account — MediCare HMS" },
      {
        name: "description",
        content: "Register as a doctor or patient to use the MediCare hospital management system.",
      },
      { property: "og:title", content: "Create an account — MediCare HMS" },
      { property: "og:description", content: "Doctor and patient registration for MediCare HMS." },
    ],
  }),
  component: RegisterPage,
});

const field = "space-y-1.5";

type DoctorErrors = Partial<
  Record<"name" | "emailId" | "contactNumber" | "specialization" | "department" | "password", string>
>;
type PatientErrors = Partial<
  Record<
    "name" | "age" | "email" | "phone" | "disease" | "bloodGroup" | "address" | "password",
    string
  >
>;

function DoctorForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    emailId: "",
    contactNumber: "",
    specialization: "",
    department: "",
    bio: "",
    password: "",
  });
  const [errors, setErrors] = useState<DoctorErrors>({});
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: DoctorErrors = {};
    if (form.name.trim().length < 2) e.name = "Name is required";
    if (!/^\S+@\S+\.\S+$/.test(form.emailId.trim())) e.emailId = "Enter a valid email";
    if (!/^\d{10}$/.test(form.contactNumber.trim())) e.contactNumber = "Enter a 10-digit number";
    if (!form.specialization.trim()) e.specialization = "Specialization is required";
    if (!form.department.trim()) e.department = "Department is required";
    if (form.password.length < 6) e.password = "Minimum 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api("/api/auth/doctor/register", {
        method: "POST",
        auth: false,
        body: {
          name: form.name.trim(),
          emailId: form.emailId.trim(),
          contactNumber: Number(form.contactNumber),
          specialization: form.specialization.trim(),
          department: form.department.trim(),
          available: true,
          bio: form.bio.trim(),
          password: form.password,
        },
      });
      toast.success("Doctor account created. Please log in.");
      navigate({ to: "/login" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={field}>
          <Label htmlFor="d-name">Full name</Label>
          <Input
            id="d-name"
            value={form.name}
            maxLength={100}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Dr. Sharma"
          />
          {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
        </div>
        <div className={field}>
          <Label htmlFor="d-email">Email</Label>
          <Input
            id="d-email"
            type="email"
            value={form.emailId}
            maxLength={255}
            onChange={(e) => set("emailId", e.target.value)}
            placeholder="sharma@hospital.com"
          />
          {errors.emailId ? <p className="text-xs text-destructive">{errors.emailId}</p> : null}
        </div>
        <div className={field}>
          <Label htmlFor="d-contact">Contact number</Label>
          <Input
            id="d-contact"
            inputMode="numeric"
            value={form.contactNumber}
            maxLength={10}
            onChange={(e) => set("contactNumber", e.target.value.replace(/\D/g, ""))}
            placeholder="9876543210"
          />
          {errors.contactNumber ? (
            <p className="text-xs text-destructive">{errors.contactNumber}</p>
          ) : null}
        </div>
        <div className={field}>
          <Label htmlFor="d-spec">Specialization</Label>
          <Input
            id="d-spec"
            value={form.specialization}
            maxLength={80}
            onChange={(e) => set("specialization", e.target.value)}
            placeholder="Cardiology"
          />
          {errors.specialization ? (
            <p className="text-xs text-destructive">{errors.specialization}</p>
          ) : null}
        </div>
        <div className={field}>
          <Label htmlFor="d-dept">Department</Label>
          <Input
            id="d-dept"
            value={form.department}
            maxLength={80}
            onChange={(e) => set("department", e.target.value)}
            placeholder="Heart"
          />
          {errors.department ? (
            <p className="text-xs text-destructive">{errors.department}</p>
          ) : null}
        </div>
        <div className={field}>
          <Label htmlFor="d-pass">Password</Label>
          <Input
            id="d-pass"
            type="password"
            value={form.password}
            maxLength={100}
            onChange={(e) => set("password", e.target.value)}
            placeholder="••••••••"
          />
          {errors.password ? <p className="text-xs text-destructive">{errors.password}</p> : null}
        </div>
      </div>
      <div className={field}>
        <Label htmlFor="d-bio">Bio</Label>
        <Textarea
          id="d-bio"
          value={form.bio}
          maxLength={500}
          onChange={(e) => set("bio", e.target.value)}
          placeholder="Senior Cardiologist with 12 years of experience"
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Spinner className="text-primary-foreground" /> : null}
        Create doctor account
      </Button>
    </form>
  );
}

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function PatientForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    age: "",
    email: "",
    phone: "",
    disease: "",
    bloodGroup: "",
    address: "",
    password: "",
  });
  const [errors, setErrors] = useState<PatientErrors>({});
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: PatientErrors = {};
    if (form.name.trim().length < 2) e.name = "Name is required";
    const age = Number(form.age);
    if (!form.age || Number.isNaN(age) || age < 0 || age > 120) e.age = "Enter a valid age";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = "Enter a valid email";
    if (!/^\d{10}$/.test(form.phone.trim())) e.phone = "Enter a 10-digit number";
    if (!form.disease.trim()) e.disease = "Disease / condition is required";
    if (!form.bloodGroup) e.bloodGroup = "Select a blood group";
    if (!form.address.trim()) e.address = "Address is required";
    if (form.password.length < 6) e.password = "Minimum 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api("/api/auth/patient/register", {
        method: "POST",
        auth: false,
        body: {
          name: form.name.trim(),
          age: Number(form.age),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
          disease: form.disease.trim(),
          bloodGroup: form.bloodGroup,
          address: form.address.trim(),
        },
      });
      toast.success("Patient account created. Please log in.");
      navigate({ to: "/login" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={field}>
          <Label htmlFor="p-name">Full name</Label>
          <Input
            id="p-name"
            value={form.name}
            maxLength={100}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Rahul Kumar"
          />
          {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
        </div>
        <div className={field}>
          <Label htmlFor="p-age">Age</Label>
          <Input
            id="p-age"
            inputMode="numeric"
            value={form.age}
            maxLength={3}
            onChange={(e) => set("age", e.target.value.replace(/\D/g, ""))}
            placeholder="25"
          />
          {errors.age ? <p className="text-xs text-destructive">{errors.age}</p> : null}
        </div>
        <div className={field}>
          <Label htmlFor="p-email">Email</Label>
          <Input
            id="p-email"
            type="email"
            value={form.email}
            maxLength={255}
            onChange={(e) => set("email", e.target.value)}
            placeholder="rahul@gmail.com"
          />
          {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
        </div>
        <div className={field}>
          <Label htmlFor="p-phone">Phone</Label>
          <Input
            id="p-phone"
            inputMode="numeric"
            value={form.phone}
            maxLength={10}
            onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))}
            placeholder="9876543210"
          />
          {errors.phone ? <p className="text-xs text-destructive">{errors.phone}</p> : null}
        </div>
        <div className={field}>
          <Label htmlFor="p-disease">Disease / condition</Label>
          <Input
            id="p-disease"
            value={form.disease}
            maxLength={80}
            onChange={(e) => set("disease", e.target.value)}
            placeholder="heart"
          />
          {errors.disease ? <p className="text-xs text-destructive">{errors.disease}</p> : null}
        </div>
        <div className={field}>
          <Label htmlFor="p-blood">Blood group</Label>
          <select
            id="p-blood"
            value={form.bloodGroup}
            onChange={(e) => set("bloodGroup", e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="">Select blood group</option>
            {bloodGroups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          {errors.bloodGroup ? (
            <p className="text-xs text-destructive">{errors.bloodGroup}</p>
          ) : null}
        </div>
        <div className={field}>
          <Label htmlFor="p-address">Address</Label>
          <Input
            id="p-address"
            value={form.address}
            maxLength={200}
            onChange={(e) => set("address", e.target.value)}
            placeholder="Mumbai"
          />
          {errors.address ? <p className="text-xs text-destructive">{errors.address}</p> : null}
        </div>
        <div className={field}>
          <Label htmlFor="p-pass">Password</Label>
          <Input
            id="p-pass"
            type="password"
            value={form.password}
            maxLength={100}
            onChange={(e) => set("password", e.target.value)}
            placeholder="••••••••"
          />
          {errors.password ? <p className="text-xs text-destructive">{errors.password}</p> : null}
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Spinner className="text-primary-foreground" /> : null}
        Create patient account
      </Button>
    </form>
  );
}

function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 rounded-2xl bg-primary p-3 shadow-card">
            <HeartPulse className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="text-sm text-muted-foreground">Join MediCare HMS in a minute</p>
        </div>
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Registration</CardTitle>
            <CardDescription>Select the account type you want to create.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="doctor">
              <TabsList className="mb-5 grid w-full grid-cols-2">
                <TabsTrigger value="doctor">Doctor Register</TabsTrigger>
                <TabsTrigger value="patient">Patient Register</TabsTrigger>
              </TabsList>
              <TabsContent value="doctor">
                <DoctorForm />
              </TabsContent>
              <TabsContent value="patient">
                <PatientForm />
              </TabsContent>
            </Tabs>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already registered?{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
