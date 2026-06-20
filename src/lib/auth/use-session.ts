"use client";

import * as React from "react";

import type { Me } from "@/lib/queries";
import { useMe } from "@/lib/queries";
import { createClient } from "@/utils/supabase/client";

export type SessionUser = {
  name: string;
  email: string;
  orgName: string;
  role: string;
  loading: boolean;
};

/**
 * Real session user: backend /me (name/org/role) with the Supabase session as
 * fallback for email/name before /me resolves. Replaces the old STUB_USER.
 */
export function useSessionUser(): SessionUser {
  const { data: me, isLoading } = useMe();
  const [fallbackEmail, setFallbackEmail] = React.useState("");
  const [fallbackName, setFallbackName] = React.useState("");

  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (u) {
        setFallbackEmail(u.email ?? "");
        const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
        setFallbackName(
          (meta.full_name as string) || (meta.name as string) || "",
        );
      }
    });
  }, []);

  const m = me as Me | undefined;
  const email = m?.email || fallbackEmail;
  const name =
    m?.fullName || fallbackName || (email ? email.split("@")[0] : "Usuario");
  return {
    name,
    email: email || "—",
    orgName: m?.orgName || "—",
    role: m?.role || "",
    loading: isLoading,
  };
}
