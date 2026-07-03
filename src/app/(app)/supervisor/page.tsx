import type { Metadata } from "next";

import { SupervisorManager } from "./supervisor-manager";

export const metadata: Metadata = {
  title: "Supervisores",
};

export default function SupervisorPage() {
  return <SupervisorManager />;
}
