// Lightweight persistence for the pre-login "Apply" capture flow.
//
// We let visitors enter a few engaging, low-sensitivity details (bank, phone,
// vehicle number) BEFORE asking them to create an account. Those answers are
// stashed in localStorage and rehydrated by the authenticated Onboarding form
// so the user never re-types them. Nothing sensitive (PAN, DOB, documents) is
// collected here — that stays behind the login boundary.

export const APPLY_DRAFT_KEY = "applyDraft";

// Banks offered on the landing page. Keys must match BANK_PRICING in
// Onboarding.tsx / Payment.tsx so the selection carries through to payment.
export const APPLY_BANKS = [
  { name: "SBI", key: "SBI", price: 400 },
  { name: "IDFC FIRST", key: "IDFC", price: 500 },
  { name: "LivQuik", key: "LivQuick", price: 400 },
  { name: "Axis", key: "Axis", price: 500 },
] as const;

export const DELIVERY_FEE = 100;

export interface ApplyDraft {
  bank?: string;
  phone?: string;
  vehicle?: string;
}

const VALID_BANKS = new Set<string>(APPLY_BANKS.map((b) => b.key));

export function saveApplyDraft(draft: ApplyDraft): void {
  try {
    localStorage.setItem(APPLY_DRAFT_KEY, JSON.stringify(draft));
    // Keep the long-standing selectedBank key in sync so existing readers
    // (Onboarding bank initializer, Payment page) keep working unchanged.
    if (draft.bank && VALID_BANKS.has(draft.bank)) {
      localStorage.setItem("selectedBank", draft.bank);
    }
  } catch {
    /* ignore storage failures (private mode, quota) */
  }
}

export function readApplyDraft(): ApplyDraft {
  try {
    const raw = localStorage.getItem(APPLY_DRAFT_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ApplyDraft;
    if (!parsed || typeof parsed !== "object") return {};
    const draft: ApplyDraft = {};
    if (parsed.bank && VALID_BANKS.has(parsed.bank)) draft.bank = parsed.bank;
    if (typeof parsed.phone === "string") draft.phone = parsed.phone;
    if (typeof parsed.vehicle === "string") draft.vehicle = parsed.vehicle;
    return draft;
  } catch {
    return {};
  }
}

// Called once Onboarding has consumed the draft, so a later visit starts clean.
export function clearApplyDraft(): void {
  try {
    localStorage.removeItem(APPLY_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}
