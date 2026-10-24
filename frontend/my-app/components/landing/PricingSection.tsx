import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CarFront, Truck } from "lucide-react";
import { SectionHeading } from "./FeaturesSection";
import { saveApplyDraft } from "../../utils/applyDraft";

// 4-wheeler FASTag pricing per partner bank (₹)
// `key` must match the keys in Payment.tsx BANK_PRICING so the selection
// carries through to the payment page.
const banks = [
  { name: "SBI", key: "SBI", price: 400, accent: "bg-sky-500" },
  { name: "IDFC FIRST", key: "IDFC", price: 500, accent: "bg-rose-500" },
  { name: "LivQuik", key: "LivQuick", price: 400, accent: "bg-emerald-500" },
  { name: "Axis", key: "Axis", price: 500, accent: "bg-indigo-500" },
];

const DELIVERY_FEE = 100;

export default function PricingSection() {
  const navigate = useNavigate();

  // Remember the bank the user picked so the apply flow (and later the payment
  // page) can pre-select it, then send the user into the public apply flow.
  const handleApply = (bankKey: string) => {
    saveApplyDraft({ bank: bankKey });
    navigate("/apply");
  };

  return (
    <div>
      <SectionHeading
        eyebrow="Pricing"
        title={
          <>
            Pick a bank, <span className="text-blue-600">hit the road</span>
          </>
        }
        subtitle="Transparent 4-wheeler FASTag pricing. No hidden charges — just a flat ₹100 doorstep delivery."
      />

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {banks.map((bank, i) => (
          <motion.div
            key={bank.name}
            initial={{ opacity: 0, y: 24, rotate: i % 2 ? 1.5 : -1.5 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            whileHover={{ rotate: 0, y: -6 }}
            className="relative flex flex-col overflow-hidden rounded-3xl border-2 border-slate-900 bg-white shadow-[6px_6px_0_0_#0F172A]"
          >
            {/* Toll-ticket header */}
            <div className={`${bank.accent} flex items-center justify-between px-5 py-4 text-white`}>
              <span className="font-display text-2xl font-extrabold">{bank.name}</span>
              <CarFront className="h-6 w-6" />
            </div>

            <div className="px-5 pb-4 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">4-wheeler FASTag</p>
              <p className="mt-1 font-display text-5xl font-extrabold text-slate-900">₹{bank.price}</p>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600">
                <Truck className="h-4 w-4 text-emerald-600" /> + ₹{DELIVERY_FEE} doorstep delivery
              </p>
            </div>

            {/* Perforated tear line with ticket notches */}
            <div className="relative my-1 border-t-2 border-dashed border-slate-300">
              <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full border-2 border-slate-900 bg-amber-50 [clip-path:inset(0_0_0_50%)]" />
              <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full border-2 border-slate-900 bg-amber-50 [clip-path:inset(0_50%_0_0)]" />
            </div>

            <div className="mt-auto flex items-center justify-between gap-3 px-5 pb-5 pt-4">
              <div>
                <p className="text-xs text-slate-500">Total</p>
                <p className="text-xl font-bold text-slate-900">₹{bank.price + DELIVERY_FEE}</p>
              </div>
              <button
                onClick={() => handleApply(bank.key)}
                className="rounded-xl border-2 border-slate-900 bg-yellow-400 px-4 py-2 text-sm font-bold text-slate-900 transition-transform hover:-translate-y-0.5"
                aria-label={`Apply for ${bank.name} FASTag`}
              >
                Apply
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
