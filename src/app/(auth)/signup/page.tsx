import type { Metadata } from "next";

import { SignupForm } from "@/app/(auth)/signup/signup-form";

export const metadata: Metadata = {
  title: "Crear cuenta",
};

export default function SignupPage() {
  return <SignupForm />;
}
