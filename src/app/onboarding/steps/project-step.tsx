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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  projectStepSchema,
  slugify,
  type ProjectStepInput,
} from "@/lib/onboarding/schemas";

type Props = {
  defaultValues: ProjectStepInput;
  onSubmit: (values: ProjectStepInput) => void;
  renderActions: (state: { submitting: boolean }) => React.ReactNode;
};

export function ProjectStep({ defaultValues, onSubmit, renderActions }: Props) {
  const form = useForm<ProjectStepInput>({
    resolver: zodResolver(projectStepSchema),
    defaultValues,
  });

  const slugTouched = React.useRef(Boolean(defaultValues.project_slug));

  const projectName = form.watch("project_name");
  React.useEffect(() => {
    if (!slugTouched.current && projectName) {
      form.setValue("project_slug", slugify(projectName), {
        shouldValidate: false,
      });
    }
  }, [projectName, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <FormField
          control={form.control}
          name="project_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del proyecto</FormLabel>
              <FormControl>
                <Input placeholder="Bot Ventas Q1" autoFocus {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="project_slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input
                  placeholder="bot-ventas-q1"
                  {...field}
                  onChange={(e) => {
                    slugTouched.current = true;
                    field.onChange(e);
                  }}
                />
              </FormControl>
              <FormDescription>
                Se usa en URLs: insyta.io/{field.value || "tu-slug"}.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="project_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripcion (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="Para que es este proyecto?"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {renderActions({ submitting: form.formState.isSubmitting })}
      </form>
    </Form>
  );
}
