import { Navbar } from "@/components/landing/navbar";
import { LandingBackground } from "@/components/landing/landing-background";
import { Hero } from "@/components/landing/hero";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { Integrations } from "@/components/landing/integrations";
import { Faq } from "@/components/landing/faq";
import { CtaBand } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <div className="relative isolate min-h-screen">
      <LandingBackground />
      <Navbar />
      <main>
        <Hero />
        <DashboardPreview />
        <HowItWorks />
        <Features />
        <Integrations />
        <Faq />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}
