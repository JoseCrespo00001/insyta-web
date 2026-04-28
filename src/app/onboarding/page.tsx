import type { Metadata } from "next";

import { OnboardingWizard } from "@/app/onboarding/wizard";

export const metadata: Metadata = {
  title: "Configuracion inicial",
};

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
