import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CarFront, Menu, X, BadgeIndianRupee, Truck, Timer, CheckCircle2 } from "lucide-react";
import Mascot from "./Mascot";
import { SideCar, DeliveryTruck } from "./Vehicles";

const navigationItems = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

export function Logo({ light = true }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-900 bg-yellow-400 shadow-[2px_2px_0_0_#0F172A]">
        <CarFront className="h-5 w-5 text-slate-900" strokeWidth={2.5} />
      </div>
      <span className={`font-display text-2xl font-extrabold leading-none ${light ? "text-white" : "text-slate-900"}`}>
        Tag<span className="text-yellow-400">Seva</span>
      </span>
    </div>
  );
}

/** Animated highway strip: vehicles drive through a FASTag toll gantry. */
function HighwayScene() {
  return (
    <div className="relative h-44 w-full overflow-hidden" aria-hidden="true">
      {/* Hills */}
      <svg className="absolute bottom-20 left-0 w-full" viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ height: 90 }}>
        <path d="M0 120 L0 70 Q180 10 360 60 T720 50 T1080 40 T1440 60 L1440 120 Z" fill="#166534" />
        <path d="M0 120 L0 90 Q240 40 480 85 T960 75 T1440 85 L1440 120 Z" fill="#15803D" />
      </svg>

      {/* Toll gantry */}
      <div className="absolute bottom-6 left-1/2 z-0 flex -translate-x-1/2 flex-col items-center">
        <div className="rounded-md border-2 border-white bg-emerald-600 px-3 py-1 font-display text-xs font-bold tracking-wide text-white shadow-lg sm:text-sm">
          FASTag LANE
        </div>
        <div className="my-1 flex gap-1.5">
          <span className="toll-blink h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="toll-blink h-2.5 w-2.5 rounded-full bg-emerald-400 [animation-delay:0.4s]" />
        </div>
        <div className="h-24 w-2.5 rounded-t bg-slate-300" />
      </div>

      {/* Road */}
      <div className="absolute bottom-0 h-20 w-full border-t-4 border-slate-500 bg-slate-800">
        <div className="road-dashes absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2" />
      </div>

      {/* Traffic */}
      <div className="drive absolute bottom-10 z-10" style={{ animationDuration: "10s", animationDelay: "-1s" }}>
        <SideCar className="w-24 sm:w-28" color="#EF4444" />
      </div>
      <div className="drive absolute bottom-10 z-10" style={{ animationDuration: "10s", animationDelay: "-6s" }}>
        <SideCar className="w-24 sm:w-28" color="#A855F7" />
      </div>
      <div className="drive absolute bottom-1 z-10" style={{ animationDuration: "14s", animationDelay: "-4s" }}>
        <DeliveryTruck className="w-36 sm:w-44" />
      </div>
      <div className="drive absolute bottom-2 z-10" style={{ animationDuration: "14s", animationDelay: "-11s" }}>
        <SideCar className="w-24 sm:w-28" color="#22C55E" />
      </div>
    </div>
  );
}

export default function HeroHeader() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="w-full">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B1F4B]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="TagSeva home">
            <Logo />
          </button>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
            {navigationItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href)}
                className="text-sm font-semibold text-white/80 transition-colors hover:text-yellow-300"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <button
              onClick={() => navigate("/login")}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="rounded-xl border-2 border-slate-900 bg-yellow-400 px-4 py-2 text-sm font-bold text-slate-900 shadow-[3px_3px_0_0_#0F172A] transition-transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Get FASTag
            </button>
          </div>

          <button
            className="rounded-lg p-2 text-white hover:bg-white/10 md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 px-4 pb-4 md:hidden">
            <nav className="flex flex-col py-2" aria-label="Mobile">
              {navigationItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.href)}
                  className="py-3 text-left text-base font-semibold text-white/90 hover:text-yellow-300"
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => navigate("/login")} className="rounded-xl border-2 border-white/30 py-2.5 font-semibold text-white">
                Login
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="rounded-xl border-2 border-slate-900 bg-yellow-400 py-2.5 font-bold text-slate-900"
              >
                Get FASTag
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0B1F4B] via-[#123A86] to-[#1D4ED8] text-white">
        {/* Clouds (kept away from the headline) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {[
            "right-[38%] top-8 w-28 opacity-20",
            "right-[6%] top-[52%] w-36 opacity-15 [animation-delay:-10s]",
            "left-[44%] top-[62%] w-24 opacity-10 [animation-delay:-18s]",
          ].map((cls) => (
            <svg key={cls} viewBox="0 0 120 50" className={`cloud absolute ${cls}`} fill="#FFFFFF">
              <path d="M20 46 Q2 46 4 32 Q6 20 22 22 Q26 6 46 8 Q60 0 72 12 Q92 6 98 24 Q118 24 116 38 Q114 46 100 46 Z" />
            </svg>
          ))}
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-yellow-300/20 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-4 pt-12 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pt-20">
          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-7 text-center lg:text-left"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              FASTag from SBI, IDFC FIRST, LivQuik &amp; Axis
            </span>

            <h1 className="font-display text-5xl font-extrabold leading-[1.05] sm:text-6xl">
              Skip the queue.
              <br />
              <span className="relative inline-block text-yellow-300">
                Zip through tolls.
                <svg className="absolute -bottom-3 left-0 w-full" viewBox="0 0 300 12" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M2 8 Q150 -2 298 8" stroke="#FACC15" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="14 10" />
                </svg>
              </span>
            </h1>

            <p className="mx-auto max-w-xl text-lg text-blue-100 lg:mx-0">
              Apply for your FASTag online in minutes — upload documents, pay securely and get it delivered right to your
              doorstep.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <button
                onClick={() => navigate("/signup")}
                className="group inline-flex items-center gap-2 rounded-2xl border-2 border-slate-900 bg-yellow-400 px-7 py-4 text-lg font-bold text-slate-900 shadow-[5px_5px_0_0_#0F172A] transition-transform hover:-translate-y-1 active:translate-y-0"
              >
                Apply for FASTag
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => handleNavClick("#how-it-works")}
                className="rounded-2xl border-2 border-white/30 px-7 py-4 text-lg font-semibold text-white transition-colors hover:bg-white/10"
              >
                How it works
              </button>
            </div>

            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-blue-100 lg:justify-start">
              <li className="flex items-center gap-1.5">
                <BadgeIndianRupee className="h-4 w-4 text-yellow-300" /> Starting at ₹400
              </li>
              <li className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-yellow-300" /> Doorstep delivery
              </li>
              <li className="flex items-center gap-1.5">
                <Timer className="h-4 w-4 text-yellow-300" /> Delivered in 3–5 days
              </li>
            </ul>
          </motion.div>

          {/* Mascot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative mx-auto w-full max-w-md"
          >
            <div className="absolute inset-x-8 bottom-6 top-16 rounded-full bg-yellow-300/25 blur-3xl" aria-hidden="true" />

            {/* Speech bubble */}
            <div className="relative z-10 mx-auto mb-2 w-fit rounded-2xl border-2 border-slate-900 bg-white px-5 py-3 text-slate-900 shadow-[4px_4px_0_0_#0F172A]">
              <p className="font-display text-lg font-bold leading-tight">Hi, I'm Tagu! 👋</p>
              <p className="text-sm text-slate-600">Let's get your FASTag on the road.</p>
              <span className="absolute -bottom-[9px] left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-slate-900 bg-white" />
            </div>

            <Mascot className="relative z-10 mx-auto w-72 drop-shadow-2xl sm:w-80" />

            {/* Floating status chips */}
            <div className="float-slow absolute -left-6 top-[58%] z-20 hidden items-center gap-2 rounded-xl border-2 border-slate-900 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-[3px_3px_0_0_#0F172A] sm:flex">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Toll paid automatically
            </div>
            <div className="float-slow absolute bottom-6 right-0 z-20 hidden items-center gap-2 rounded-xl border-2 border-slate-900 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-[3px_3px_0_0_#0F172A] [animation-delay:-2s] sm:flex">
              <Truck className="h-5 w-5 text-blue-600" /> Out for delivery
            </div>
          </motion.div>
        </div>

        <HighwayScene />
      </section>
    </div>
  );
}
