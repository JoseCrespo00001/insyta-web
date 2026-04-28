import { Suspense } from "react";
import type { Metadata } from "next";

import { LoginForm } from "@/app/(auth)/login/login-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Iniciar sesion",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[420px] w-full" />}>
      <LoginForm />
    </Suspense>
  );
}
