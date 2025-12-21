import { FeaturesSection } from "@/components/landing/features-section";
import LandingFooter from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { LandingNavbar } from "@/components/landing/navbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background-night text-white selection:bg-white/20 overflow-x-hidden">
      <LandingNavbar />

      <main id="main-content" className="pt-32 pb-20 space-y-32">
        <Hero />
        <FeaturesSection />
        <LandingFooter />
      </main>
    </div>
  );
}
