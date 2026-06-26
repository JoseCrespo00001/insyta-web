"use client";

import * as React from "react";
import {
  Check,
  Code2,
  Copy,
  GitMerge,
  Loader2,
  Save,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { mergeNodeIntoFlow } from "@/lib/projects/flow-merge";

function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = React.useState(false);
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="h-7 gap-1.5 text-xs"
      onClick={() => {
        void navigator.clipboard.writeText(text);
        setDone(true);
        window.setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? (
        <Check className="h-3.5 w-3.5 text-score-good" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {done ? "Copiado" : label}
    </Button>
  );
}

/**
 * Muestra, debajo de una sugerencia de mejora del flujo, el JSON del nodo a
 * agregar y el prompt para pasarle a la IA constructora — ambos copiables.
 */
function MergeButton({
  flowJson,
  nodeJson,
}: {
  flowJson: string;
  nodeJson: string;
}) {
  const [state, setState] = React.useState<"idle" | "done" | "error">("idle");
  return (
    <Button
      type="button"
      size="sm"
      className="h-7 gap-1.5 text-xs"
      onClick={() => {
        try {
          const { json } = mergeNodeIntoFlow(flowJson, nodeJson);
          void navigator.clipboard.writeText(json);
          setState("done");
        } catch {
          setState("error");
        }
        window.setTimeout(() => setState("idle"), 1800);
      }}
    >
      {state === "done" ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <GitMerge className="h-3.5 w-3.5" />
      )}
      {state === "done"
        ? "Flujo copiado"
        : state === "error"
          ? "No se pudo mergear"
          : "Copiar flujo completo (con el nodo)"}
    </Button>
  );
}

/**
 * Aplica el nodo sugerido al flujo (merge) y dispara onApply con el JSON
 * resultante para que el contenedor lo persista como versión nueva.
 */
function ApplyButton({
  flowJson,
  nodeJson,
  applying,
  applied,
  onApply,
}: {
  flowJson: string;
  nodeJson: string;
  applying?: boolean;
  applied?: boolean;
  onApply: (mergedFlowJson: string) => void;
}) {
  const [error, setError] = React.useState(false);
  if (applied) {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled
        className="h-7 gap-1.5 text-xs"
      >
        <Check className="h-3.5 w-3.5 text-score-good" />
        Aplicada al flujo
      </Button>
    );
  }
  return (
    <Button
      type="button"
      size="sm"
      className="h-7 gap-1.5 text-xs"
      disabled={applying}
      onClick={() => {
        try {
          const { json } = mergeNodeIntoFlow(flowJson, nodeJson);
          setError(false);
          onApply(json);
        } catch {
          setError(true);
        }
      }}
    >
      {applying ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Save className="h-3.5 w-3.5" />
      )}
      {error ? "No se pudo aplicar" : "Aplicar al flujo y guardar"}
    </Button>
  );
}

export function SuggestionExtras({
  nodeJson,
  prompt,
  flowJson,
  onApply,
  applying,
  applied,
}: {
  nodeJson?: string | null;
  prompt?: string | null;
  flowJson?: string | null; // si viene, habilita el merge al flujo completo
  // Si viene, habilita "Aplicar al flujo y guardar" (persiste una versión).
  onApply?: (mergedFlowJson: string) => void;
  applying?: boolean;
  applied?: boolean;
}) {
  if (!nodeJson && !prompt) return null;
  return (
    <div className="mt-2 space-y-2">
      {onApply && flowJson && nodeJson ? (
        <ApplyButton
          flowJson={flowJson}
          nodeJson={nodeJson}
          applying={applying}
          applied={applied}
          onApply={onApply}
        />
      ) : null}
      {prompt ? (
        <details className="rounded-md border bg-muted/30">
          <summary className="flex cursor-pointer items-center gap-1.5 px-3 py-2 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Prompt para la IA del flujo
          </summary>
          <div className="space-y-2 px-3 pb-3">
            <p className="whitespace-pre-wrap text-xs text-muted-foreground">
              {prompt}
            </p>
            <CopyButton text={prompt} label="Copiar prompt" />
          </div>
        </details>
      ) : null}
      {nodeJson ? (
        <details className="rounded-md border bg-muted/30">
          <summary className="flex cursor-pointer items-center gap-1.5 px-3 py-2 text-xs font-medium">
            <Code2 className="h-3.5 w-3.5 text-primary" />
            JSON sugerido para el flujo
          </summary>
          <div className="space-y-2 px-3 pb-3">
            <pre className="max-h-72 overflow-auto rounded bg-muted p-2 font-mono text-[11px] leading-relaxed">
              {nodeJson}
            </pre>
            <div className="flex flex-wrap gap-2">
              <CopyButton text={nodeJson} label="Copiar nodo" />
              {flowJson ? (
                <MergeButton flowJson={flowJson} nodeJson={nodeJson} />
              ) : null}
            </div>
          </div>
        </details>
      ) : null}
    </div>
  );
}
