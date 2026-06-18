import { slugify } from "@/lib/format";
import type { Audit } from "./types";

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
