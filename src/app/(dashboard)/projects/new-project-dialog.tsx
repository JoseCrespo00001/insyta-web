"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { CopyButton } from "@/components/shared/copy-button";
import { projectsApi } from "@/lib/api/fetchers";
import { queryKeys } from "@/lib/api/keys";
import { slugify } from "@/lib/format";
import type { ProjectCreateResponse } from "@/lib/api/schemas";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const formSchema = z.object({
  name: z.string().min(2, "Nombre muy corto.").max(80),
  slug: z
    .string()
    .min(2, "Slug muy corto.")
    .max(40)
    .regex(slugRegex, "Solo minusculas, numeros y guiones."),
  description: z.string().max(280).optional(),
});
type FormValues = z.infer<typeof formSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/* UX Review — NewProjectDialog
 * User: Operador que necesita crear un proyecto para empezar a recibir conversaciones.
 * Goal: Crear proyecto + obtener webhook secret en <30 segundos.
 * Flow: click "Nuevo proyecto" -> form (name, slug autogen, descr) -> POST -> SECRET REVEAL screen.
 * States: form (idle/submitting/error) | secret-reveal (success). NO unmount entre states asi el secret no se pierde.
 * Edge cases:
 *  - Stripe-style secret reveal: solo se muestra una vez, con warning explicito.
 *  - Cierre accidental del modal en pantalla de secret -> guard "Estas seguro?" via confirmacion explicita por el boton.
 *  - Slug colisiona (409) -> mensaje del backend mapeado a "Ese slug ya existe".
 *  - Doble click submit -> button disabled.
 * Benchmark: Stripe API key creation pattern.
 */
export function NewProjectDialog({ open, onOpenChange }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [createdProject, setCreatedProject] =
    React.useState<ProjectCreateResponse | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", slug: "", description: "" },
  });

  const slugTouched = React.useRef(false);
  const projectName = form.watch("name");
  React.useEffect(() => {
    if (!slugTouched.current && projectName) {
      form.setValue("slug", slugify(projectName), { shouldValidate: false });
    }
  }, [projectName, form]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      projectsApi.create({
        name: values.name,
        slug: values.slug,
        description: values.description,
      }),
    onSuccess: (data) => {
      setCreatedProject(data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error
          ? err.message.toLowerCase().includes("slug")
            ? "Ese slug ya existe en tu organizacion. Elegi otro."
            : err.message
          : "No pudimos crear el proyecto. Intenta de nuevo.";
      form.setError("root", { message: msg });
      toast.error(msg);
    },
  });

  const reset = () => {
    form.reset({ name: "", slug: "", description: "" });
    slugTouched.current = false;
    setCreatedProject(null);
    mutation.reset();
  };

  const handleClose = (next: boolean) => {
    if (!next && createdProject) {
      // Forzar al usuario a confirmar (boton). No cerrar al click-outside.
      return;
    }
    onOpenChange(next);
    if (!next) {
      // Defer reset hasta animacion close.
      window.setTimeout(reset, 250);
    }
  };

  const goToProject = () => {
    if (!createdProject) return;
    onOpenChange(false);
    router.push(`/projects/${createdProject.public_id}`);
    window.setTimeout(reset, 250);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[480px]"
        onPointerDownOutside={(e) => {
          if (createdProject) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (createdProject) e.preventDefault();
        }}
      >
        {createdProject ? (
          <SecretReveal project={createdProject} onConfirm={goToProject} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Nuevo proyecto</DialogTitle>
              <DialogDescription>
                Vas a poder asignarle agentes y empezar a recibir
                conversaciones.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                id="new-project-form"
                onSubmit={form.handleSubmit((values) =>
                  mutation.mutate(values),
                )}
                className="space-y-4"
                noValidate
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input
                          autoFocus
                          placeholder="Bot Ventas Q1"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
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
                        Identificador en URLs. Solo minusculas, numeros y
                        guiones.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
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
                {form.formState.errors.root ? (
                  <p
                    role="alert"
                    className="text-sm font-medium text-destructive"
                  >
                    {form.formState.errors.root.message}
                  </p>
                ) : null}
              </form>
            </Form>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleClose(false)}
                disabled={mutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form="new-project-form"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear proyecto"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SecretReveal({
  project,
  onConfirm,
}: {
  project: ProjectCreateResponse;
  onConfirm: () => void;
}) {
  return (
    <>
      <DialogHeader>
        <div className="mb-1 flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" aria-hidden />
          <DialogTitle>Proyecto creado</DialogTitle>
        </div>
        <DialogDescription>
          Guarda tu webhook secret ahora. No vas a poder verlo de nuevo.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-amber-900 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p className="text-xs leading-relaxed">
            Este secret se muestra <strong>una sola vez</strong>. Si lo perdes,
            tendras que rotarlo desde la configuracion del proyecto.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Webhook secret
          </p>
          <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 font-mono text-xs">
            <code className="min-w-0 flex-1 truncate">
              {project.webhook_secret}
            </code>
            <CopyButton
              value={project.webhook_secret}
              label="Copiar"
              variant="default"
            />
          </div>
        </div>

        <div className="space-y-1 rounded-md border bg-card px-3 py-2">
          <p className="text-xs text-muted-foreground">Proyecto</p>
          <p className="text-sm font-medium">{project.name}</p>
          <p className="font-mono text-xs text-muted-foreground">
            {project.public_id}
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button onClick={onConfirm}>Ya guarde el secret, abrir proyecto</Button>
      </DialogFooter>
    </>
  );
}
