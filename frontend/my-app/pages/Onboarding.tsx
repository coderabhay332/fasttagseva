import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../stores';
import { createApplicationThunk, getApplicationByIdThunk } from '../stores/slices/applicationSlice';
import { createPaymentThunk } from '../stores/slices/paymentSlice';
import { profileService } from '../services/profile';
import { listMyPayments, syncApplicationPayments } from '../services/applications';
import { useTransactionSocket } from '../hooks/use-transaction-socket';
import { toast } from 'sonner';
import Card, { CardBody, CardHeader, CardFooter } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Stepper from '../components/ui/Stepper';
import PaymentOptionCard from '../components/PaymentOptionCard';
import { readApplyDraft, clearApplyDraft } from '../utils/applyDraft';
import {
	ArrowLeft,
	ArrowRight,
	PartyPopper,
	Clock,
	BadgePlus,
	RefreshCw,
	Truck,
	UserCheck,
	CalendarCheck,
	ShieldAlert,
	FileText,
	Bell,
	XCircle,
} from 'lucide-react';

// A flow this light only needs three real steps. FASTagSeva takes over once
// payment lands, so there is no document or delivery collection here.
const STEPS = [
	{ key: 'service', label: 'Service' },
	{ key: 'details', label: 'Your details' },
	{ key: 'pay', label: 'Payment' },
	{ key: 'done', label: 'Done' },
];

const stepIndexOf = (key: string) => STEPS.findIndex((s) => s.key === key);

// The services FASTagSeva offers. `value` matches the backend SERVICE_TYPES enum.
const SERVICES = [
	{ value: 'NEW_FASTAG', label: 'New FASTag', hint: 'Apply for a brand new FASTag', icon: BadgePlus },
	{ value: 'REPLACEMENT_FASTAG', label: 'Replacement FASTag', hint: 'Replace a lost or damaged tag', icon: RefreshCw },
	{ value: 'COMMERCIAL_FASTAG', label: 'Commercial FASTag', hint: 'For trucks & commercial vehicles', icon: Truck },
	{ value: 'KYC_KYV', label: 'KYC / KYV Update', hint: 'Update your KYC or vehicle details', icon: UserCheck },
	{ value: 'ANNUAL_PASS', label: 'Annual Pass', hint: 'Activate the NHAI annual pass', icon: CalendarCheck },
	{ value: 'BLACKLIST_HOTLIST', label: 'Blacklist / Hotlist', hint: 'Resolve a blacklisted tag', icon: ShieldAlert },
	{ value: 'VRN_UPDATE', label: 'VRN Update', hint: 'Update vehicle registration number', icon: FileText },
	{ value: 'E_NOTICE', label: 'E-Notice', hint: 'E-Notice related assistance', icon: Bell },
	{ value: 'TAG_CLOSURE', label: 'Tag Closure', hint: 'Close an existing FASTag', icon: XCircle },
] as const;

type ServiceValue = (typeof SERVICES)[number]['value'];

const BANK_PRICING: Record<string, number> = {
	SBI: 400,
	IDFC: 500,
	LivQuick: 400,
	Axis: 500,
};

const PHONE_RE = /^\d{10}$/;

export default function Onboarding() {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { id: routeId } = useParams();
	const { user } = useAppSelector((s) => s.auth);
	const payment = useAppSelector((s) => s.payment);

	const [stepIndex, setStepIndex] = useState(0);
	const [appId, setAppId] = useState<string | null>(routeId || null);
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	// A visitor may have entered a few details on the public /apply page before
	// signing up. Rehydrate them here so nothing is re-typed. Cleared once read.
	const draft = useMemo(() => readApplyDraft(), []);

	// Step 0 — service
	const [serviceType, setServiceType] = useState<ServiceValue | ''>('');

	// Step 1 — details
	const [phone, setPhone] = useState(draft.phone || '');
	const [vehicle, setVehicle] = useState(draft.vehicle || '');
	const [notes, setNotes] = useState('');

	// Step 2 — payment
	const [bank, setBank] = useState<string>(() => {
		try {
			const stored = localStorage.getItem('selectedBank');
			if (stored && Object.prototype.hasOwnProperty.call(BANK_PRICING, stored)) return stored;
		} catch {}
		return 'SBI';
	});
	const [paid, setPaid] = useState(false);
	// True when the user came back from the gateway but we could NOT confirm a
	// successful payment (failed, cancelled, or still pending). Drives a clear
	// retry/exit banner instead of silently showing a bare payment form.
	const [returnedUnpaid, setReturnedUnpaid] = useState(false);
	const price = useMemo(() => BANK_PRICING[bank], [bank]);

	// Real-time transaction updates. When the gateway's webhook reaches the
	// backend it emits here, so the UI reflects PAID/FAILED immediately instead
	// of relying solely on the polling fallback in waitForPaid.
	useTransactionSocket({
		onUpdate: (event) => {
			if (appId && event.applicationId && event.applicationId !== appId) return;
			if (event.paymentStatus === 'PAID') {
				setPaid(true);
				setReturnedUnpaid(false);
				setStepIndex(stepIndexOf('done'));
				toast.success('Payment received! Your request is in.');
			} else if (event.paymentStatus === 'FAILED') {
				setReturnedUnpaid(true);
				toast.error('Payment failed. Please try again.');
			} else if (event.paymentStatus === 'CANCELLED') {
				setReturnedUnpaid(true);
				toast.error('Payment was cancelled. You can retry whenever you are ready.');
			}
		},
	});

	// Prefill the phone saved at signup / in the profile.
	useEffect(() => {
		clearApplyDraft();
		(async () => {
			try {
				const res = await profileService.getProfile();
				const p = res?.data;
				if (p) setPhone((v) => v || p.phone || '');
			} catch {}
		})();
	}, []);

	// Resume flow: if we arrived with an application id, load it and land the
	// user on the right step based on real payment state.
	useEffect(() => {
		if (!routeId) return;
		setAppId(routeId);
		(async () => {
			try {
				const res = await dispatch(getApplicationByIdThunk(routeId));
				const data: any = (res as any).payload;
				if (data) {
					setServiceType((v) => v || (data.serviceType as ServiceValue) || '');
					setVehicle((v) => v || data.vehicle || '');
					setNotes((v) => v || data.notes || '');
				}
			} catch {}

			const isPaid = await waitForPaid(routeId);
			if (isPaid) {
				setStepIndex(stepIndexOf('done'));
			} else {
				// Did the user just come back from the gateway? If so, we tried to
				// reconcile and still couldn't confirm payment — surface a clear
				// retry/exit banner rather than a silent bare payment form.
				const params = new URLSearchParams(window.location.search);
				if (params.get('pay') === 'return') {
					setReturnedUnpaid(true);
					// Drop the marker so a later refresh doesn't keep showing it.
					window.history.replaceState(null, '', `/onboarding/${routeId}`);
				}
				setStepIndex(stepIndexOf('pay'));
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [routeId]);

	const refreshPaid = async (id: string): Promise<boolean> => {
		try {
			const res = await listMyPayments(1, 100);
			const payments = res.data?.data?.payments || res.data?.payments || [];
			const isPaid = payments.some((p: any) => p.applicationId === id && p.paymentStatus === 'PAID');
			setPaid(isPaid);
			return isPaid;
		} catch {
			return false;
		}
	};

	// On return from the gateway the webhook may lag (or be missed), so first
	// ask the backend to reconcile, then poll a few times before concluding the
	// user still needs to pay.
	const waitForPaid = async (id: string): Promise<boolean> => {
		try {
			const res = await syncApplicationPayments(id);
			if (res.data?.data?.paid) {
				setPaid(true);
				return true;
			}
		} catch {
			// Sync is best-effort; fall back to polling below.
		}
		for (let attempt = 0; attempt < 4; attempt++) {
			const ok = await refreshPaid(id);
			if (ok) return true;
			await new Promise((r) => setTimeout(r, 1500));
		}
		return false;
	};

	const goNext = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
	const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

	// ---- Step actions -------------------------------------------------------

	const chooseService = (value: ServiceValue) => {
		setError(null);
		setServiceType(value);
		goNext();
	};

	// Create the application once we have the service + minimal details, then
	// move to payment. Reuses an existing application if one is already open.
	const saveDetails = async () => {
		setError(null);
		if (!serviceType) return setError('Please pick a service first.');
		if (!vehicle.trim()) return setError('Vehicle number is required.');
		if (!PHONE_RE.test(phone.trim())) return setError('Enter a valid 10-digit mobile number.');
		setBusy(true);
		try {
			// Keep the phone on the profile so payment & staff have it.
			try {
				await profileService.updateProfile({ phone: phone.trim() });
			} catch {}

			if (appId) {
				goNext();
				return;
			}
			const res = await dispatch(
				createApplicationThunk({
					serviceType,
					vehicle: vehicle.trim().toUpperCase(),
					notes: notes.trim() || undefined,
				})
			);
			if ((res as any).type?.endsWith('fulfilled')) {
				const id = (res as any).payload?._id || (res as any).payload?.id;
				setAppId(id);
				window.history.replaceState(null, '', `/onboarding/${id}`);
				goNext();
			} else {
				setError((res as any).payload || 'Could not create your request.');
			}
		} finally {
			setBusy(false);
		}
	};

	const startPayment = async () => {
		setError(null);
		setReturnedUnpaid(false);
		if (!appId || !user) return setError('Something went wrong — please restart.');
		if (!PHONE_RE.test(phone.trim())) return setError('A valid 10-digit phone is required for payment.');
		try { localStorage.setItem('selectedBank', bank); } catch {}
		const res = await dispatch(
			createPaymentThunk({
				amount: price,
				customerName: user.name || 'Customer',
				customerEmail: user.email || 'email@example.com',
				customerPhone: phone.trim(),
				applicationId: appId,
				bankName: bank,
			})
		);
		if ((res as any).type?.endsWith('fulfilled')) {
			const paymentUrl = (res as any).payload?.data?.paymentUrl;
			if (paymentUrl) {
				// External gateway; user returns to /onboarding/:id afterwards.
				window.location.href = paymentUrl;
				return;
			}
			// No redirect needed — payment is settled.
			await refreshPaid(appId);
			setStepIndex(stepIndexOf('done'));
		} else {
			setError((res as any).payload || 'Payment could not be started.');
		}
	};

	// ---- Render -------------------------------------------------------------

	const step = STEPS[stepIndex].key;
	const selectedService = SERVICES.find((s) => s.value === serviceType);

	return (
		<div className="min-h-screen bg-amber-50 py-10">
			<div className="mx-auto max-w-3xl px-4">
				<div className="mb-8">
					<Stepper steps={STEPS} current={stepIndex} />
				</div>

				{error && (
					<div className="mb-4 rounded-xl border-2 border-red-500 bg-red-50 p-3 text-sm font-semibold text-red-700">
						{error}
					</div>
				)}

				{/* STEP 0 — Pick a service */}
				{step === 'service' && (
					<Card>
						<CardHeader>What do you need help with?</CardHeader>
						<CardBody>
							<div className="grid gap-3 sm:grid-cols-2">
								{SERVICES.map(({ value, label, hint, icon: Icon }) => {
									const selected = serviceType === value;
									return (
										<button
											key={value}
											type="button"
											onClick={() => chooseService(value)}
											className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition ${
												selected
													? 'border-slate-900 bg-yellow-400'
													: 'border-slate-200 bg-white hover:border-slate-900'
											}`}
										>
											<span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border-2 border-slate-900 bg-yellow-400">
												<Icon className="h-5 w-5 text-slate-900" strokeWidth={2.5} />
											</span>
											<span>
												<span className="block font-display font-extrabold text-slate-900">{label}</span>
												<span className="block text-sm text-slate-600">{hint}</span>
											</span>
										</button>
									);
								})}
							</div>
						</CardBody>
					</Card>
				)}

				{/* STEP 1 — Details */}
				{step === 'details' && (
					<Card>
						<CardHeader>
							{selectedService ? `${selectedService.label} — your details` : 'Your details'}
						</CardHeader>
						<CardBody className="space-y-5">
							<Input
								label="Vehicle number"
								placeholder="e.g. MH01AB1234"
								value={vehicle}
								onChange={(e) => setVehicle(e.target.value.toUpperCase())}
							/>
							<Input
								label="Mobile number"
								placeholder="10-digit number"
								inputMode="numeric"
								value={phone}
								onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
							/>
							<div>
								<label className="mb-1.5 block text-sm font-semibold text-slate-800">
									Anything we should know? <span className="font-normal text-slate-400">(optional)</span>
								</label>
								<textarea
									className="w-full rounded-xl border-2 border-slate-200 p-3 text-slate-900 outline-none focus:border-slate-900"
									rows={3}
									placeholder="e.g. details about your request"
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
								/>
							</div>
						</CardBody>
						<CardFooter className="flex justify-between">
							<Button variant="ghost" onClick={goBack}>
								<ArrowLeft className="h-5 w-5" /> Back
							</Button>
							<Button onClick={saveDetails} loading={busy}>
								Continue <ArrowRight className="h-5 w-5" />
							</Button>
						</CardFooter>
					</Card>
				)}

				{/* STEP 2 — Payment */}
				{step === 'pay' && (
					<Card>
						<CardHeader>Choose a bank &amp; pay</CardHeader>
						<CardBody className="space-y-5">
							{returnedUnpaid && (
								<div className="rounded-xl border-2 border-amber-500 bg-amber-50 p-4 text-sm text-amber-900">
									<p className="font-semibold">We couldn't confirm your payment.</p>
									<p className="mt-1">
										If money was deducted, it will be verified automatically and reflected
										shortly — no need to pay again. Otherwise you can retry below, or come back
										to it later from your requests.
									</p>
									<div className="mt-3 flex flex-wrap gap-2">
										{appId && (
											<Button
												variant="secondary"
												size="sm"
												onClick={async () => {
													const ok = await waitForPaid(appId);
													if (ok) setStepIndex(stepIndexOf('done'));
													else toast.info('Still not confirmed. You can retry payment.');
												}}
											>
												Check again
											</Button>
										)}
										<Button variant="ghost" size="sm" onClick={() => navigate('/my-application')}>
											Go to my requests
										</Button>
									</div>
								</div>
							)}
							<div className="grid gap-3">
								{Object.keys(BANK_PRICING).map((b) => (
									<PaymentOptionCard
										key={b}
										bank={b}
										price={BANK_PRICING[b]}
										selected={bank === b}
										onSelect={() => setBank(b)}
									/>
								))}
							</div>
							<div className="flex items-center justify-between rounded-xl border-2 border-slate-900 bg-white p-4">
								<span className="font-display font-extrabold text-slate-900">Total</span>
								<span className="font-display text-2xl font-extrabold text-slate-900">₹{price}</span>
							</div>
							<p className="flex items-center gap-1.5 text-xs text-slate-500">
								<Clock className="h-4 w-4" /> Our team takes over as soon as your payment is confirmed.
							</p>
						</CardBody>
						<CardFooter className="flex items-center justify-between">
							<button
								type="button"
								className="text-sm font-semibold text-slate-500 underline underline-offset-2 hover:text-slate-900"
								onClick={() => navigate('/my-application')}
							>
								I'll pay later
							</button>
							<Button onClick={startPayment} loading={payment.loading} size="lg">
								{returnedUnpaid ? 'Retry payment' : `Pay ₹${price}`} <ArrowRight className="h-5 w-5" />
							</Button>
						</CardFooter>
					</Card>
				)}

				{/* STEP 3 — Done */}
				{step === 'done' && (
					<Card>
						<CardBody className="space-y-5 py-10 text-center">
							<span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border-2 border-slate-900 bg-emerald-400 brand-shadow-md">
								<PartyPopper className="h-8 w-8 text-slate-900" strokeWidth={2.5} />
							</span>
							<h2 className="font-display text-3xl font-extrabold text-slate-900">Request received!</h2>
							<p className="mx-auto max-w-md text-slate-600">
								{selectedService ? `Your ${selectedService.label} request is in.` : 'Your request is in.'}{' '}
								Our team will reach out and handle the rest for you.
							</p>
							<div className="flex flex-wrap justify-center gap-3">
								<Button variant="secondary" onClick={() => navigate('/my-application')}>
									View my requests
								</Button>
								{appId && (
									<Button onClick={() => navigate(`/status/${appId}`)}>Track request</Button>
								)}
							</div>
						</CardBody>
					</Card>
				)}
			</div>
		</div>
	);
}
