import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { clearSession, getSession, isTokenExpired, type Role, type Session } from "./api";

export function useSession() {
  const [session, setSessionState] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      const s = getSession();
      if (s && isTokenExpired(s.token)) {
        clearSession();
        setSessionState(null);
      } else {
        setSessionState(s);
      }
      setReady(true);
    };
    sync();
    window.addEventListener("hms-auth", sync);
    window.addEventListener("storage", sync);
    const timer = window.setInterval(sync, 30000);
    return () => {
      window.removeEventListener("hms-auth", sync);
      window.removeEventListener("storage", sync);
      window.clearInterval(timer);
    };
  }, []);

  return { session, ready };
}

/** Redirects to /login when there is no session, or when the role is wrong. */
export function useRequireAuth(role?: Role) {
  const { session, ready } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;
    if (!session) {
      navigate({ to: "/login", replace: true });
    } else if (role && session.role !== role) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [ready, session, role, navigate]);

  return { session, ready, allowed: !!session && (!role || session.role === role) };
}
