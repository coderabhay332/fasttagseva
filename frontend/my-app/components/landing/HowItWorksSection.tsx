import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  BadgeCheck,
  FileDigit,
  SquareChevronRight,
  CornerRightDown,
  Truck,
} from "lucide-react";
import { SectionHeading } from "./FeaturesSection";

interface Step {
  id: number;
  title: string;
  caption: string;
  icon: React.ElementType;
  details: string[];
  isDelivery?: boolean;
}

const steps: Step[] = [
  {
    id: 1,
    title: "Sign Up",
    caption: "Create your account",
    icon: BadgeCheck,
    details: [
      "Provide basic contact information",
      "Verify your mobile number",
      "Set secure password",
    ],
  },
  {
    id: 2,
    title: "Apply",
    caption: "Fill application form",
    icon: FileDigit,
    details: [
      "Enter vehicle details",
      "Select FASTag bank preference",
      "Choose delivery address",
    ],
  },
  {
    id: 3,
    title: "Upload Documents",
    caption: "Submit required papers",
    icon: SquareChevronRight,
    details: [
      "Upload clear copies of RC",
      "Provide valid ID proof",
      "Submit passport-size photo",
      "Ensure all documents are legible",
    ],
  },
  {
    id: 4,
    title: "Pay",
    caption: "Complete secure payment",
    icon: BadgeCheck,
    details: [
      "Pay FASTag amount + charges",
      "Use UPI, cards, or net banking",
      "Get instant payment confirmation",
    ],
  },
  {
    id: 5,
    title: "Agent Delivers",
    caption: "Receive at your doorstep",
    icon: CornerRightDown,
    details: [
      "Agent calls to confirm delivery time",
      "FASTag delivered to your address",
      "Get installation assistance if needed",
    ],
    isDelivery: true,
  },
];

export default function HowItWorksSection() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const stepRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (activeStep === null) return;

      const currentIndex = steps.findIndex((step) => step.id === activeStep);

      if (event.key === "ArrowLeft" && currentIndex > 0) {
        event.preventDefault();
        const prevStep = steps[currentIndex - 1];
        setActiveStep(prevStep.id);
        stepRefs.current[currentIndex - 1]?.focus();
      } else if (event.key === "ArrowRight" && currentIndex < steps.length - 1) {
        event.preventDefault();
        const nextStep = steps[currentIndex + 1];
        setActiveStep(nextStep.id);
        stepRefs.current[currentIndex + 1]?.focus();
      } else if (event.key === "Escape") {
        event.preventDefault();
        setActiveStep(null);
      }
    };

    if (activeStep !== null) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [activeStep]);

  const handleStepClick = (stepId: number) => {
    setActiveStep(activeStep === stepId ? null : stepId);
  };

  const handleStartApplication = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      navigate("/apply");
    }, 600);
  };

  return (
    <div>
      <SectionHeading
        eyebrow="How it works"
        title={
          <>
            Five steps to your <span className="text-blue-600">FASTag</span>
          </>
        }
        subtitle="A simple 5-step process to get your FASTag delivered to your doorstep. Tap a step for details."
      />

      {/* Desktop Horizontal Steps */}
      <div className="hidden lg:block">
        <div className="flex items-start justify-between gap-4">
          {steps.map((step, index) => (
            <div key={step.id} className="relative flex flex-1 flex-col items-center">
              <button
                ref={(el) => {
                  stepRefs.current[index] = el;
                }}
                onClick={() => handleStepClick(step.id)}
                className="group w-full rounded-3xl focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400"
                aria-expanded={activeStep === step.id}
                aria-describedby={`step-${step.id}-details`}
              >
                <div
                  className={`flex flex-col items-center rounded-3xl border-2 border-slate-900 bg-white p-6 text-center shadow-[6px_6px_0_0_#0F172A] transition-transform duration-200 group-hover:-translate-y-1.5 ${
                    activeStep === step.id ? "-translate-y-1.5 bg-yellow-50" : ""
                  }`}
                >
                  {/* Step number badge */}
                  <div className="mb-4 grid h-12 w-12 place-items-center rounded-full border-2 border-slate-900 bg-yellow-400 font-display text-lg font-extrabold text-slate-900 shadow-[3px_3px_0_0_#0F172A]">
                    {step.id}
                  </div>

                  <step.icon className="mb-3 h-6 w-6 text-slate-900" strokeWidth={2.5} />

                  <h3 className="font-display text-lg font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{step.caption}</p>

                  {step.isDelivery && (
                    <span className="mt-3 inline-flex items-center gap-1 rounded-md border-2 border-slate-900 bg-emerald-300 px-2 py-0.5 text-xs font-bold text-slate-900">
                      <Truck className="h-3.5 w-3.5" /> Delivery ₹100
                    </span>
                  )}
                </div>
              </button>

              {/* Details Panel */}
              {activeStep === step.id && (
                <div
                  id={`step-${step.id}-details`}
                  className="absolute top-full z-20 mt-4 w-64 rounded-2xl border-2 border-slate-900 bg-white p-4 shadow-[6px_6px_0_0_#0F172A]"
                >
                  <ul className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start text-sm">
                        <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
                        <span className="text-slate-600">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile/Tablet Vertical Steps */}
      <div className="lg:hidden">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute bottom-0 left-6 top-0 w-0.5 bg-slate-900/20" />

          {steps.map((step, index) => (
            <div key={step.id} className="relative mb-8 last:mb-0">
              <button
                ref={(el) => {
                  stepRefs.current[index] = el;
                }}
                onClick={() => handleStepClick(step.id)}
                className="group flex w-full items-start text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 rounded-3xl"
                aria-expanded={activeStep === step.id}
                aria-describedby={`step-${step.id}-details`}
              >
                {/* Step number badge */}
                <div className="relative z-10 grid h-12 w-12 flex-shrink-0 place-items-center rounded-full border-2 border-slate-900 bg-yellow-400 font-display text-lg font-extrabold text-slate-900 shadow-[3px_3px_0_0_#0F172A]">
                  {step.id}
                </div>

                <div
                  className={`ml-6 flex-1 rounded-3xl border-2 border-slate-900 bg-white p-4 shadow-[6px_6px_0_0_#0F172A] transition-transform duration-200 group-hover:-translate-y-1 ${
                    activeStep === step.id ? "bg-yellow-50" : ""
                  }`}
                >
                  <div className="mb-1 flex items-center">
                    <step.icon className="mr-2 h-5 w-5 text-slate-900" strokeWidth={2.5} />
                    <h3 className="font-display text-base font-bold text-slate-900">{step.title}</h3>
                    {step.isDelivery && (
                      <span className="ml-auto inline-flex items-center gap-1 rounded-md border-2 border-slate-900 bg-emerald-300 px-2 py-0.5 text-xs font-bold text-slate-900">
                        <Truck className="h-3.5 w-3.5" /> ₹100
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{step.caption}</p>
                </div>
              </button>

              {/* Details Panel */}
              {activeStep === step.id && (
                <div
                  id={`step-${step.id}-details`}
                  className="ml-[4.5rem] mt-4 rounded-2xl border-2 border-slate-900 bg-white p-4 shadow-[6px_6px_0_0_#0F172A]"
                >
                  <ul className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start text-sm">
                        <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
                        <span className="text-slate-600">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Start Application CTA */}
      <div className="mt-14 text-center">
        <button
          onClick={handleStartApplication}
          disabled={isAnimating}
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl border-2 border-slate-900 bg-yellow-400 px-8 py-4 text-lg font-bold text-slate-900 shadow-[5px_5px_0_0_#0F172A] transition-transform hover:-translate-y-1 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-80"
        >
          {isAnimating ? (
            <>
              <span className="opacity-0">Start Application</span>
              <span className="absolute inset-x-6 bottom-3 h-1 overflow-hidden rounded bg-slate-900/20">
                <span className="block h-full bg-slate-900 animate-[loading_600ms_ease-in-out]" />
              </span>
            </>
          ) : (
            <>
              Start Application
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </div>

      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
