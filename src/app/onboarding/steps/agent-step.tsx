"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  agentStepSchema,
  PLATFORMS,
  type AgentStepInput,
} from "@/lib/onboarding/schemas";

type Props = {
  defaultValues: AgentStepInput;
  onSubmit: (values: AgentStepInput) => void;
  renderActions: (state: { submitting: boolean }) => React.ReactNode;
};

export function AgentStep({ defaultValues, onSubmit, renderActions }: Props) {
  const form = useForm<AgentStepInput>({
    resolver: zodResolver(agentStepSchema),
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
          name="agent_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del agente</FormLabel>
              <FormControl>
                <Input placeholder="WhatsApp Ventas" autoFocus {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="platform"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plataforma origen</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Elige una plataforma" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      <span className="font-medium">{p.label}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {p.hint}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {renderActions({ submitting: form.formState.isSubmitting })}
      </form>
    </Form>
  );
}
