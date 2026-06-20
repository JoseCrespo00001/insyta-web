"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { createClient } from "@/utils/supabase/client";

/**
 * Ensures the authenticated Supabase user has a provisioned org+user in the
 * backend (idempotent bootstrap), then refreshes /me. Renders nothing.
 * Handles the case where a session exists but bootstrap never ran (e.g. the
 * API was restarted), so the dashboard works without a manual re-login.
 */
export function BootstrapGate() {
  const qc = useQueryClient();

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session || cancelled) return;
      try {
        await api.post("/api/v1/auth/bootstrap");
        if (!cancelled) {
          qc.invalidateQueries({ queryKey: ["me"] });
          qc.invalidateQueries({ queryKey: ["projects"] });
          qc.invalidateQueries({ queryKey: ["dashboard"] });
        }
      } catch {
        // Not signed in or API down — pages will surface their own errors.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [qc]);

  return null;
}
