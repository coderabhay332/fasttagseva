import HeroHeader from "../components/landing/HeroHeader";
import FeaturesSection from "../components/landing/FeaturesSection";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import PricingSection from "../components/landing/PricingSection";
import CtaSection from "../components/landing/CtaSection";
import Footer from "../components/landing/Footer";

export default function Landing() {
  return (
    <main className="min-h-screen bg-amber-50">
      <HeroHeader />

      <section id="pricing" className="scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <PricingSection />
        </div>
      </section>

      <section id="features" className="scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <FeaturesSection />
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-16 bg-slate-900 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <HowItWorksSection />
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
        <div className="mx-auto max-w-6xl">
          <CtaSection />
        </div>
      </section>

      <Footer />
    </main>
  );
}
