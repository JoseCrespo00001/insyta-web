"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  promptStepSchema,
  type PromptStepInput,
} from "@/lib/onboarding/schemas";

type Props = {
  defaultValues: PromptStepInput;
  onSubmit: (values: PromptStepInput) => void;
  submitting: boolean;
  renderActions: (state: { submitting: boolean }) => React.ReactNode;
};

export function PromptStep({
  defaultValues,
  onSubmit,
  submitting,
  renderActions,
}: Props) {
  const form = useForm<PromptStepInput>({
    resolver: zodResolver(promptStepSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <FormField
          control={form.control}
          name="system_prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>System prompt (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  rows={8}
                  placeholder="Sos un asesor comercial. Tu objetivo es..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Lo usamos para evaluar si tu agente sigue el instructivo. Podes
                pegarlo despues desde la configuracion del agente.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {renderActions({
          submitting: form.formState.isSubmitting || submitting,
        })}
      </form>
    </Form>
  );
}
