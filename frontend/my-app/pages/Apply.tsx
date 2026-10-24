import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../stores";
import {
  ArrowRight,
  ArrowLeft,
  CarFront,
  Truck,
  ShieldCheck,
  Phone,
  Check,
} from "lucide-react";
import {
  APPLY_BANKS,
  DELIVERY_FEE,
  readApplyDraft,
  saveApplyDraft,
} from "../utils/applyDraft";

const PHONE_RE = /^\d{10}$/;
// Loose Indian plate check, e.g. MH12AB1234 — spaces/hyphens stripped first.
const VEHICLE_RE = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{3,4}$/;

/**
 * Public "Apply" capture page. Collects a few low-sensitivity details (bank,
 * phone, vehicle number) BEFORE asking the visitor to sign up, so people stay
 * engaged instead of bouncing off an immediate login wall. The answers are
 * stashed via saveApplyDraft and picked up by the authenticated Onboarding
 * form after the user creates an account.
 */
export default function Apply() {
  const navigate = useNavigate();
  const { accessToken } = useAppSelector((s) => s.auth);

  const draft = readApplyDraft();
  const [step, setStep] = useState<0 | 1>(0);
  const [bank, setBank] = useState<string>(draft.bank || "SBI");
  const [phone, setPhone] = useState(draft.phone || "");
  const [vehicle, setVehicle] = useState(draft.vehicle || "");
  const [error, setError] = useState<string | null>(null);

  const selected = APPLY_BANKS.find((b) => b.key === bank) ?? APPLY_BANKS[0];
  const total = selected.price + DELIVERY_FEE;

  const persist = () =>
    saveApplyDraft({
      bank,
      phone: phone.trim(),
      vehicle: vehicle.trim().toUpperCase(),
    });

  const handleContinue = () => {
    setError(null);
    if (!PHONE_RE.test(phone.trim())) {
      return setError("Enter a valid 10-digit mobile number.");
    }
    const cleanVehicle = vehicle.trim().toUpperCase().replace(/[\s-]/g, "");
    if (!VEHICLE_RE.test(cleanVehicle)) {
      return setError("Enter a valid vehicle number, e.g. MH12AB1234.");
    }
    setVehicle(cleanVehicle);
    persist();
    setStep(1);
  };

  // Hand off to auth. Onboarding is the post-login destination; it rehydrates
  // the draft we just saved. If the visitor is already logged in, skip auth.
  const goToAuth = (path: "/signup" | "/login") => {
    persist();
    if (accessToken) {
      navigate("/onboarding");
      return;
    }
    navigate(path, { state: { from: { pathname: "/onboarding" } } });
  };

  return (
    <div className="min-h-screen bg-amber-50 py-10">
      <div className="mx-auto max-w-2xl px-4">
        <button
          onClick={() => navigate("/")}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </button>

        <div className="mb-8 text-center">
          <span className="inline-block rounded-md border-2 border-slate-900 bg-yellow-400 px-3 py-1 font-display text-sm font-bold uppercase tracking-wider text-slate-900 shadow-[3px_3px_0_0_#0F172A]">
            Apply in 2 minutes
          </span>
          <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
            Let's get your <span className="text-blue-600">FASTag</span>
          </h1>
          <p className="mt-3 text-slate-600">
            {step === 0
              ? "Pick your bank and tell us about your vehicle. No account needed yet."
              : "Almost there — create your account to finish and pay."}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border-2 border-red-500 bg-red-50 p-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {step === 0 && (
          <div className="rounded-3xl border-2 border-slate-900 bg-white p-6 shadow-[6px_6px_0_0_#0F172A] sm:p-8">
            {/* Bank picker */}
            <label className="mb-2 block font-display text-lg font-bold text-slate-900">
              Choose your bank
            </label>
            <div className="mb-6 grid grid-cols-2 gap-3">
              {APPLY_BANKS.map((b) => {
                const active = b.key === bank;
                return (
                  <button
                    key={b.key}
                    type="button"
                    onClick={() => setBank(b.key)}
                    className={`relative flex items-center justify-between rounded-2xl border-2 border-slate-900 px-4 py-3 text-left transition-transform hover:-translate-y-0.5 ${
                      active ? "bg-yellow-400" : "bg-white"
                    }`}
                  >
                    <span>
                      <span className="block font-display text-base font-bold text-slate-900">
                        {b.name}
                      </span>
                      <span className="text-sm text-slate-600">₹{b.price}</span>
                    </span>
                    {active && (
                      <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-slate-900 bg-slate-900 text-white">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Phone */}
            <label className="mb-2 block font-display text-lg font-bold text-slate-900">
              Mobile number
            </label>
            <div className="mb-5 flex items-center gap-2 rounded-2xl border-2 border-slate-900 bg-white px-4 py-3">
              <Phone className="h-5 w-5 text-slate-500" />
              <span className="font-semibold text-slate-700">+91</span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="10-digit number"
                className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Vehicle number */}
            <label className="mb-2 block font-display text-lg font-bold text-slate-900">
              Vehicle number
            </label>
            <div className="mb-6 flex items-center gap-2 rounded-2xl border-2 border-slate-900 bg-white px-4 py-3">
              <CarFront className="h-5 w-5 text-slate-500" />
              <input
                type="text"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value.toUpperCase())}
                placeholder="e.g. MH12AB1234"
                className="w-full bg-transparent uppercase text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Price summary */}
            <div className="mb-6 flex items-center justify-between rounded-2xl border-2 border-dashed border-slate-300 bg-amber-50 px-4 py-3">
              <span className="flex items-center gap-1.5 text-sm text-slate-600">
                <Truck className="h-4 w-4 text-emerald-600" /> incl. ₹{DELIVERY_FEE} doorstep delivery
              </span>
              <span className="font-display text-xl font-extrabold text-slate-900">
                ₹{total}
              </span>
            </div>

            <button
              onClick={handleContinue}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-900 bg-yellow-400 px-6 py-4 text-lg font-bold text-slate-900 shadow-[5px_5px_0_0_#0F172A] transition-transform hover:-translate-y-1 active:translate-y-0"
            >
              Continue
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="rounded-3xl border-2 border-slate-900 bg-white p-6 shadow-[6px_6px_0_0_#0F172A] sm:p-8">
            {/* Recap of what they entered */}
            <div className="mb-6 space-y-2 rounded-2xl border-2 border-slate-900 bg-amber-50 p-4">
              <Row label="Bank" value={`${selected.name} · ₹${selected.price}`} />
              <Row label="Mobile" value={`+91 ${phone}`} />
              <Row label="Vehicle" value={vehicle} />
              <div className="mt-2 flex items-center justify-between border-t-2 border-dashed border-slate-300 pt-2">
                <span className="text-sm font-semibold text-slate-600">Total</span>
                <span className="font-display text-lg font-extrabold text-slate-900">₹{total}</span>
              </div>
            </div>

            <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
              <ShieldCheck className="h-5 w-5 flex-shrink-0" />
              Create an account to save your progress, upload documents and pay securely.
            </div>

            <button
              onClick={() => goToAuth("/signup")}
              className="group mb-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-900 bg-yellow-400 px-6 py-4 text-lg font-bold text-slate-900 shadow-[5px_5px_0_0_#0F172A] transition-transform hover:-translate-y-1 active:translate-y-0"
            >
              Create account &amp; continue
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => goToAuth("/login")}
              className="w-full rounded-2xl border-2 border-slate-900 bg-white px-6 py-3 text-base font-semibold text-slate-900 transition-transform hover:-translate-y-0.5"
            >
              I already have an account
            </button>

            <button
              onClick={() => setStep(0)}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" /> Edit my details
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}
