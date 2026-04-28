import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const projectStepSchema = z.object({
  project_name: z
    .string()
    .min(2, "El nombre del proyecto es obligatorio.")
    .max(80, "Maximo 80 caracteres."),
  project_slug: z
    .string()
    .min(2, "Slug muy corto.")
    .max(40, "Maximo 40 caracteres.")
    .regex(slugRegex, "Solo minusculas, numeros y guiones."),
  project_description: z.string().max(280).optional(),
});
export type ProjectStepInput = z.infer<typeof projectStepSchema>;

export const PLATFORMS = [
  { value: "wati", label: "WATI", hint: "WhatsApp Business via WATI" },
  {
    value: "respond_io",
    label: "Respond.io",
    hint: "Multi-canal con Respond.io",
  },
  {
    value: "manychat",
    label: "Manychat",
    hint: "Manychat para Messenger / Instagram",
  },
  { value: "sdk", label: "SDK / Webhook", hint: "Integracion custom via SDK" },
] as const;

export const platformValues = [
  "wati",
  "respond_io",
  "manychat",
  "sdk",
] as const;

export const agentStepSchema = z.object({
  agent_name: z.string().min(2, "El nombre del agente es obligatorio.").max(80),
  platform: z.enum(platformValues, {
    message: "Elige una plataforma.",
  }),
});
export type AgentStepInput = z.infer<typeof agentStepSchema>;

export const promptStepSchema = z.object({
  system_prompt: z
    .string()
    .max(4000, "Maximo 4000 caracteres.")
    .optional()
    .or(z.literal("")),
});
export type PromptStepInput = z.infer<typeof promptStepSchema>;

export type OnboardingState = ProjectStepInput &
  AgentStepInput &
  PromptStepInput;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
}
