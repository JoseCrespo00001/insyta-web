import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { Integrations } from "@/components/landing/integrations";
import { UseCases } from "@/components/landing/use-cases";
import { Faq } from "@/components/landing/faq";
import { CtaBand } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Integrations />
        <UseCases />
        <Faq />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
