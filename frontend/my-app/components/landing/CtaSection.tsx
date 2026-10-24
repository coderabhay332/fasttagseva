import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Truck, Headphones } from "lucide-react";

const highlights = [
  { icon: ShieldCheck, label: "Bank-grade security" },
  { icon: Truck, label: "Doorstep delivery" },
  { icon: Headphones, label: "Support that responds" },
];

/** Final call-to-action band inviting the visitor to apply for a FASTag. */
export default function CtaSection() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl border-2 border-slate-900 bg-gradient-to-br from-[#0B1F4B] via-[#123A86] to-[#1D4ED8] px-6 py-14 text-center shadow-[8px_8px_0_0_#0F172A] sm:px-12 lg:py-20"
    >
      {/* Decorative glow */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-yellow-300/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />

      <div className="relative mx-auto max-w-2xl space-y-7">
        <h2 className="font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl">
          Ready to hit the road <span className="text-yellow-300">toll-free?</span>
        </h2>
        <p className="mx-auto max-w-xl text-lg text-blue-100">
          Apply for your FASTag in minutes and get it delivered to your doorstep. No queues, no paperwork hassles.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={() => navigate("/apply")}
            className="group inline-flex items-center gap-2 rounded-2xl border-2 border-slate-900 bg-yellow-400 px-8 py-4 text-lg font-bold text-slate-900 shadow-[5px_5px_0_0_#0F172A] transition-transform hover:-translate-y-1 active:translate-y-0"
          >
            Apply now
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => navigate("/login")}
            className="rounded-2xl border-2 border-white/30 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-white/10"
          >
            I already have an account
          </button>
        </div>

        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-sm font-medium text-blue-100">
          {highlights.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-1.5">
              <Icon className="h-4 w-4 text-yellow-300" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
