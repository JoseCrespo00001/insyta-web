import type { Metadata } from "next";

import { ProjectsView } from "@/app/(dashboard)/projects/projects-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Proyectos",
};

export default function ProjectsPage() {
  return <ProjectsView />;
}
