import { slugify } from "@/lib/format";
import { createClient } from "@/utils/supabase/client";
import type { Audit } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Descarga el CSV del servidor (con teléfono + segmento), respetando el filtro
 * de segmento activo. Requiere el JWT de Supabase (mismo que lib/api.ts). */
export async function downloadAuditServerCsv(
  auditId: string,
  segment?: string | null,
) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const qs = segment ? `?segment=${encodeURIComponent(segment)}` : "";
  const res = await fetch(
    `${API_URL}/api/v1/audits/${auditId}/export.csv${qs}`,
    {
      headers: session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {},
    },
  );
  if (!res.ok) throw new Error("No se pudo exportar el CSV");
  const text = await res.text();
  triggerDownload(
    `auditoria_${auditId}${segment ? `_${segment}` : ""}.csv`,
    text,
    "text/csv",
  );
}

function triggerDownload(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Reporte completo de la auditoría como JSON. */
export function downloadAuditJson(audit: Audit) {
  triggerDownload(
    `${slugify(audit.name)}.json`,
    JSON.stringify(audit, null, 2),
    "application/json",
  );
}

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** Conversaciones auditadas como CSV (una fila por conversación). */
export function downloadAuditCsv(audit: Audit) {
  const header = [
    "external_id",
    "contacto",
    "tema",
    "resolucion",
    "satisfaccion",
    "tono",
    "frustracion",
    "escalada",
    "score",
    "costo_usd",
    "tokens",
    "latencia_ms",
    "trace_id",
  ];
  const rows = audit.report.conversations.map((c) => {
    const e = c.evaluation;
    return [
      c.externalId,
      c.contactName,
      e.topic,
      e.resolution ? "sí" : "no",
      String(e.satisfaction),
      e.tone,
      e.frustration ? "sí" : "no",
      e.escalated ? "sí" : "no",
      c.score == null ? "" : String(c.score),
      e.costUsd.toFixed(4),
      String(e.tokensInput + e.tokensOutput),
      String(e.latencyMs),
      e.phoenixTraceId,
    ];
  });
  const csv = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
  triggerDownload(`${slugify(audit.name)}.csv`, csv, "text/csv;charset=utf-8");
}
