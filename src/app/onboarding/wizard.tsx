"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  type AgentStepInput,
  type OnboardingState,
  type ProjectStepInput,
  type PromptStepInput,
} from "@/lib/onboarding/schemas";
import { ProjectStep } from "@/app/onboarding/steps/project-step";
import { AgentStep } from "@/app/onboarding/steps/agent-step";
import { PromptStep } from "@/app/onboarding/steps/prompt-step";

const STEPS = [
  {
    key: "project",
    label: "Proyecto",
    description: "Crea tu primer workspace.",
  },
  {
    key: "agent",
    label: "Agente",
    description: "Decinos donde vive tu bot.",
  },
  {
    key: "prompt",
    label: "Prompt",
    description: "Opcional: pega el system prompt.",
  },
] as const;

const INITIAL_STATE: OnboardingState = {
  project_name: "",
  project_slug: "",
  project_description: "",
  agent_name: "",
  platform: "wati",
  system_prompt: "",
};

/* UX Review — OnboardingWizard
 * User: Cliente recien creado, no sabe que hacer.
 * Goal: Crear primer proyecto + agente en <2 minutos. Llegar al dashboard listo para subir un CSV.
 * Flow: /onboarding -> step 1 (project) -> step 2 (agent) -> step 3 (prompt opcional) -> CTA "subir CSV" o "conectar webhook" -> /dashboard.
 * States: idle | submitting | success (toast + redirect) | error (Wave 3 cuando endpoints existan; por ahora solo log).
 * Edge cases: usuario cierra tab mid-wizard -> NO persistimos en backend hasta el final, asi puede empezar de nuevo.
 *   Skip total: boton "Saltar" en cada step. Slug se autogenera del nombre pero es editable.
 *   Step 3 es 100% opcional — el cta "Finalizar" siempre disponible.
 * Friction points: progress bar muestra avance. Back habilitado en steps 2 y 3. Slug preview con candado para evitar miedo.
 * Benchmark: Linear/Notion onboarding (3 steps max, skippable, claro CTA final).
 */
export function OnboardingWizard() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = React.useState(0);
  const [state, setState] = React.useState<OnboardingState>(INITIAL_STATE);
  const [submitting, setSubmitting] = React.useState(false);

  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const goNext = (patch: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...patch }));
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  };

  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  const finish = async (patch: Partial<OnboardingState>) => {
    const finalState = { ...state, ...patch };
    setState(finalState);
    setSubmitting(true);
    try {
      // TODO Wave 3: POST /api/onboarding con finalState. Por ahora solo log.
      console.debug("[DEBUG] onboarding submit", finalState);
      await new Promise((r) => setTimeout(r, 400));
      toast.success("Listo. Subi tu primer CSV o conecta tu webhook.");
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("[DEBUG] onboarding submit failed", err);
      toast.error(
        "No pudimos guardar tu configuracion. Intenta de nuevo en unos segundos.",
      );
      setSubmitting(false);
    }
  };

  const skipAll = () => {
    void finish({});
  };

  const current = STEPS[stepIndex];

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Paso {stepIndex + 1} de {STEPS.length}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={skipAll}
            disabled={submitting}
          >
            Saltar configuracion
          </Button>
        </div>
        <Progress value={progress} aria-label="Progreso del onboarding" />
        <div className="space-y-1">
          <CardTitle>{current.label}</CardTitle>
          <CardDescription>{current.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {stepIndex === 0 ? (
          <ProjectStep
            defaultValues={{
              project_name: state.project_name,
              project_slug: state.project_slug,
              project_description: state.project_description,
            }}
            onSubmit={(values: ProjectStepInput) => goNext(values)}
            renderActions={({ submitting: stepSubmitting }) => (
              <CardFooter className="flex justify-end gap-2 px-0 pb-0">
                <Button type="submit" disabled={stepSubmitting}>
                  Siguiente
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            )}
          />
        ) : null}
        {stepIndex === 1 ? (
          <AgentStep
            defaultValues={{
              agent_name: state.agent_name,
              platform: state.platform,
            }}
            onSubmit={(values: AgentStepInput) => goNext(values)}
            renderActions={({ submitting: stepSubmitting }) => (
              <CardFooter className="flex justify-between gap-2 px-0 pb-0">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={goBack}
                  disabled={stepSubmitting}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Atras
                </Button>
                <Button type="submit" disabled={stepSubmitting}>
                  Siguiente
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            )}
          />
        ) : null}
        {stepIndex === 2 ? (
          <PromptStep
            defaultValues={{ system_prompt: state.system_prompt }}
            onSubmit={(values: PromptStepInput) => void finish(values)}
            submitting={submitting}
            renderActions={({ submitting: stepSubmitting }) => (
              <CardFooter className="flex justify-between gap-2 px-0 pb-0">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={goBack}
                  disabled={stepSubmitting}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Atras
                </Button>
                <Button type="submit" disabled={stepSubmitting}>
                  {stepSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Finalizando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Finalizar y subir CSV
                    </>
                  )}
                </Button>
              </CardFooter>
            )}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
