import { motion } from "framer-motion";
import { FileText, Upload, CreditCard, Truck, MapPinned, Landmark, type LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  tint: string;
}

const features: Feature[] = [
  {
    icon: FileText,
    title: "Apply in minutes",
    description: "A simple online form for your vehicle details. No queues, no running around.",
    tint: "bg-yellow-400",
  },
  {
    icon: Upload,
    title: "Easy document upload",
    description: "Upload your RC, ID proof and photo straight from your phone.",
    tint: "bg-sky-300",
  },
  {
    icon: CreditCard,
    title: "Secure payments",
    description: "Pay with UPI, debit/credit card or net banking and get instant confirmation.",
    tint: "bg-emerald-300",
  },
  {
    icon: Truck,
    title: "Doorstep delivery",
    description: "Our agent brings your FASTag to you and helps with installation if needed.",
    tint: "bg-orange-300",
  },
  {
    icon: MapPinned,
    title: "Live status tracking",
    description: "Follow your application from submission all the way to delivery.",
    tint: "bg-pink-300",
  },
  {
    icon: Landmark,
    title: "Trusted bank partners",
    description: "Choose your FASTag from SBI, IDFC FIRST, LivQuik or Axis.",
    tint: "bg-violet-300",
  },
];

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  dark = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  dark?: boolean;
}) {
  return (
    <div className="mx-auto mb-14 max-w-2xl text-center">
      <span className="inline-block rounded-md border-2 border-slate-900 bg-yellow-400 px-3 py-1 font-display text-sm font-bold uppercase tracking-wider text-slate-900 shadow-[3px_3px_0_0_#0F172A]">
        {eyebrow}
      </span>
      <h2 className={`mt-5 font-display text-4xl font-extrabold leading-tight sm:text-5xl ${dark ? "text-white" : "text-slate-900"}`}>
        {title}
      </h2>
      <p className={`mt-4 text-lg ${dark ? "text-slate-300" : "text-slate-600"}`}>{subtitle}</p>
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <div>
      <SectionHeading
        eyebrow="Why TagSeva"
        title={
          <>
            Everything for your FASTag, <span className="text-blue-600">in one lane</span>
          </>
        }
        subtitle="From application to installation — we handle the paperwork so you can enjoy the drive."
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <motion.article
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, delay: i * 0.06 }}
            className="group rounded-3xl border-2 border-slate-900 bg-white p-7 shadow-[6px_6px_0_0_#0F172A] transition-transform duration-200 hover:-translate-y-1.5"
          >
            {/* Road-sign style icon */}
            <div className="relative mb-6 ml-2 mt-2 grid h-14 w-14 rotate-45 place-items-center rounded-lg border-[3px] border-slate-900 transition-transform duration-500 group-hover:rotate-[405deg]">
              <div className={`absolute inset-0 rounded-[5px] ${f.tint}`} />
              <f.icon className="relative h-6 w-6 -rotate-45 text-slate-900" strokeWidth={2.5} />
            </div>
            <h3 className="font-display text-2xl font-bold text-slate-900">{f.title}</h3>
            <p className="mt-2 leading-relaxed text-slate-600">{f.description}</p>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
