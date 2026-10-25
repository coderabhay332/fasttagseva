import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../stores';
import { createApplicationThunk, getApplicationByIdThunk } from '../stores/slices/applicationSlice';
import { createPaymentThunk } from '../stores/slices/paymentSlice';
import { profileService } from '../services/profile';
import {
	listMyPayments,
	uploadPan,
	uploadRc,
	uploadVehicleFront,
	uploadVehicleSide,
} from '../services/applications';
import { prepareImageForUpload, UploadValidationError } from '../utils/imageUpload';
import Card, { CardBody, CardHeader, CardFooter } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Stepper from '../components/ui/Stepper';
import FileDrop from '../components/ui/FileDrop';
import PaymentOptionCard from '../components/PaymentOptionCard';
import DeliveryLocationForm from '../components/DeliveryLocationForm';
import { readApplyDraft, clearApplyDraft } from '../utils/applyDraft';
import {
	CarFront,
	FileText,
	IdCard,
	ShieldCheck,
	Clock,
	ArrowLeft,
	ArrowRight,
	PartyPopper,
} from 'lucide-react';

const STEPS = [
	{ key: 'welcome', label: 'Welcome' },
	{ key: 'details', label: 'Your details' },
	{ key: 'vehicle', label: 'Vehicle' },
	{ key: 'documents', label: 'Documents' },
	{ key: 'pay', label: 'Payment' },
	{ key: 'address', label: 'Delivery' },
	{ key: 'done', label: 'Done' },
];

const stepIndexOf = (key: string) => STEPS.findIndex((s) => s.key === key);

const BANK_PRICING: Record<string, number> = {
	SBI: 400,
	IDFC: 500,
	LivQuick: 400,
	Axis: 500,
};

const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const PHONE_RE = /^\d{10}$/;

type DocKey = 'pan' | 'rc' | 'vehicleFront' | 'vehicleSide';
interface DocSlot {
	file: File | null;
	url?: string;
	loading: boolean;
}
const emptyDocs = (): Record<DocKey, DocSlot> => ({
	pan: { file: null, loading: false },
	rc: { file: null, loading: false },
	vehicleFront: { file: null, loading: false },
	vehicleSide: { file: null, loading: false },
});

const DOC_META: { key: DocKey; label: string; hint: string }[] = [
	{ key: 'pan', label: 'PAN Card', hint: 'Clear photo of your PAN card' },
	{ key: 'rc', label: 'RC Book', hint: 'Vehicle registration certificate' },
	{ key: 'vehicleFront', label: 'Vehicle — Front', hint: 'Front view of the vehicle' },
	{ key: 'vehicleSide', label: 'Vehicle — Side', hint: 'Side view of the vehicle' },
];

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

	// Step 1 — details
	const [phone, setPhone] = useState(draft.phone || '');
	const [dob, setDob] = useState('');
	const [pan, setPan] = useState('');

	// Step 2 — vehicle
	const [vehicle, setVehicle] = useState(draft.vehicle || '');
	const [engineNumber, setEngineNumber] = useState('');
	const [chasisNumber, setChasisNumber] = useState('');

	// Step 3 — documents (files held locally until payment is confirmed)
	const [docs, setDocs] = useState<Record<DocKey, DocSlot>>(emptyDocs());

	// Step 4 — payment
	const [bank, setBank] = useState<string>(() => {
		try {
			const stored = localStorage.getItem('selectedBank');
			if (stored && Object.prototype.hasOwnProperty.call(BANK_PRICING, stored)) return stored;
		} catch {}
		return 'SBI';
	});
	const [paid, setPaid] = useState(false);
	const price = useMemo(() => BANK_PRICING[bank], [bank]);

	// Prefill profile details (phone saved at signup, plus any saved KYC).
	useEffect(() => {
		// The /apply draft has now seeded initial state; drop it so a later
		// visit starts clean and doesn't resurrect stale values.
		clearApplyDraft();
		(async () => {
			try {
				const res = await profileService.getProfile();
				const p = res?.data;
				if (p) {
					setPhone((v) => v || p.phone || '');
					setPan((v) => v || p.pancardNumber || '');
					setDob((v) => v || p.dateOfBirth || '');
				}
			} catch {}
		})();
	}, []);

	// Resume flow: if we arrived with an application id, load it and figure out
	// where to drop the user (documents vs pay) based on payment status.
	useEffect(() => {
		if (!routeId) return;
		setAppId(routeId);
		(async () => {
			try {
				const res = await dispatch(getApplicationByIdThunk(routeId));
				const data: any = (res as any).payload;
				if (data) {
					setVehicle((v) => v || data.vehicle || '');
					setEngineNumber((v) => v || data.engineNumber || '');
					setChasisNumber((v) => v || data.chasisNumber || '');
					setDocs((prev) => ({
						pan: { ...prev.pan, url: data.pancard || prev.pan.url },
						rc: { ...prev.rc, url: data.rc || prev.rc.url },
						vehicleFront: { ...prev.vehicleFront, url: data.vehicleFront || prev.vehicleFront.url },
						vehicleSide: { ...prev.vehicleSide, url: data.vehicleSide || prev.vehicleSide.url },
					}));
				}
			} catch {}
			// The user has returned from the payment gateway. Move forward to the
			// delivery-address step rather than dropping them back on an earlier
			// step. (We still refresh paid status in the background for display.)
			void waitForPaid(routeId);
			setStepIndex(stepIndexOf('address'));
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

	// On return from the payment gateway the webhook may lag a moment, so poll
	// a few times before concluding the user still needs to pay.
	const waitForPaid = async (id: string): Promise<boolean> => {
		for (let attempt = 0; attempt < 4; attempt++) {
			const ok = await refreshPaid(id);
			if (ok) return true;
			await new Promise((r) => setTimeout(r, 1500));
		}
		return false;
	};

	// Once payment is confirmed, auto-upload any files the user chose earlier.
	useEffect(() => {
		if (!paid || !appId) return;
		(async () => {
			for (const meta of DOC_META) {
				const slot = docs[meta.key];
				if (slot.file && !slot.url) {
					await doUpload(meta.key, slot.file);
				}
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [paid, appId]);

	const goNext = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
	const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

	// ---- Step actions -------------------------------------------------------

	const saveDetails = async () => {
		setError(null);
		if (!PHONE_RE.test(phone.trim())) return setError('Enter a valid 10-digit mobile number.');
		if (!dob) return setError('Please select your date of birth.');
		if (!PAN_RE.test(pan.trim().toUpperCase())) return setError('Enter a valid PAN (e.g. ABCDE1234F).');
		setBusy(true);
		try {
			await profileService.updateProfile({
				phone: phone.trim(),
				pancardNumber: pan.trim().toUpperCase(),
				dateOfBirth: dob,
			});
			goNext();
		} catch (e: any) {
			setError(e?.message || 'Could not save your details.');
		} finally {
			setBusy(false);
		}
	};

	const saveVehicle = async () => {
		setError(null);
		if (!vehicle.trim()) return setError('Vehicle number is required.');
		if (!engineNumber.trim()) return setError('Engine number is required.');
		if (!chasisNumber.trim()) return setError('Chassis number is required.');
		setBusy(true);
		try {
			// Reuse an existing application if we already created one.
			if (appId) {
				goNext();
				return;
			}
			const res = await dispatch(
				createApplicationThunk({
					vehicle: vehicle.trim().toUpperCase(),
					engineNumber: engineNumber.trim(),
					chasisNumber: chasisNumber.trim(),
				})
			);
			if ((res as any).type?.endsWith('fulfilled')) {
				const id = (res as any).payload?._id || (res as any).payload?.id;
				setAppId(id);
				// Keep the URL resumable without a full remount.
				window.history.replaceState(null, '', `/onboarding/${id}`);
				goNext();
			} else {
				setError((res as any).payload || 'Could not create your application.');
			}
		} finally {
			setBusy(false);
		}
	};

	const doUpload = async (key: DocKey, file: File) => {
		if (!appId) return;
		setDocs((prev) => ({ ...prev, [key]: { ...prev[key], loading: true } }));
		try {
			let result: any;
			if (key === 'pan') result = await uploadPan(appId, file);
			else if (key === 'rc') result = await uploadRc(appId, file);
			else if (key === 'vehicleFront') result = await uploadVehicleFront(appId, file);
			else result = await uploadVehicleSide(appId, file);
			const url = result?.data?.data?.url || result?.data?.url;
			setDocs((prev) => ({ ...prev, [key]: { file: null, url, loading: false } }));
		} catch (e: any) {
			setDocs((prev) => ({ ...prev, [key]: { ...prev[key], loading: false } }));
			setError(`Couldn't upload ${key}. ${e?.message || ''}`);
		}
	};

	const onPickDoc = async (key: DocKey, file: File) => {
		setError(null);
		let prepared: File;
		try {
			prepared = await prepareImageForUpload(file);
		} catch (e) {
			setError(
				e instanceof UploadValidationError
					? e.message
					: 'Could not process that image. Please try another file.'
			);
			return;
		}
		setDocs((prev) => ({ ...prev, [key]: { ...prev[key], file: prepared } }));
		// Upload straight away once we have an application to attach it to.
		// (Uploads used to wait for payment confirmation, but that depends on a
		// webhook that can't reach localhost in dev and can lag in prod, so the
		// documents would silently never upload. The upload endpoints only need
		// a valid application id, which exists by this step.)
		if (appId) void doUpload(key, prepared);
	};

	const startPayment = async () => {
		setError(null);
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
			// No redirect needed — payment is settled, go collect the address.
			await refreshPaid(appId);
			setStepIndex(stepIndexOf('address'));
		} else {
			setError((res as any).payload || 'Payment could not be started.');
		}
	};

	const docsDone = DOC_META.every((m) => docs[m.key].url);

	// ---- Render -------------------------------------------------------------

	const step = STEPS[stepIndex].key;

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

				{/* STEP 0 — Welcome */}
				{step === 'welcome' && (
					<Card>
						<CardHeader>Let's get your FASTag 🚗</CardHeader>
						<CardBody className="space-y-5">
							<p className="text-slate-600">
								This takes about 3 minutes. Keep these handy before you start:
							</p>
							<ul className="space-y-3">
								{[
									{ icon: IdCard, text: 'Your PAN card' },
									{ icon: FileText, text: 'Vehicle RC book' },
									{ icon: CarFront, text: 'Two photos of your vehicle (front & side)' },
								].map(({ icon: Icon, text }) => (
									<li key={text} className="flex items-center gap-3">
										<span className="grid h-9 w-9 place-items-center rounded-lg border-2 border-slate-900 bg-yellow-400">
											<Icon className="h-5 w-5 text-slate-900" strokeWidth={2.5} />
										</span>
										<span className="font-medium text-slate-800">{text}</span>
									</li>
								))}
							</ul>
							<div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
								<ShieldCheck className="h-5 w-5" /> Your details are used only to process your FASTag.
							</div>
						</CardBody>
						<CardFooter className="flex justify-end">
							<Button onClick={goNext} size="lg">
								Start <ArrowRight className="h-5 w-5" />
							</Button>
						</CardFooter>
					</Card>
				)}

				{/* STEP 1 — Details */}
				{step === 'details' && (
					<Card>
						<CardHeader>Your details</CardHeader>
						<CardBody className="space-y-5">
							<Input
								label="Mobile number"
								placeholder="10-digit number"
								inputMode="numeric"
								value={phone}
								onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
							/>
							<Input
								label="Date of birth"
								type="date"
								value={dob}
								onChange={(e) => setDob(e.target.value)}
							/>
							<Input
								label="PAN number"
								placeholder="ABCDE1234F"
								value={pan}
								onChange={(e) => setPan(e.target.value.toUpperCase().slice(0, 10))}
							/>
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

				{/* STEP 2 — Vehicle */}
				{step === 'vehicle' && (
					<Card>
						<CardHeader>Vehicle details</CardHeader>
						<CardBody className="space-y-5">
							<Input
								label="Vehicle number"
								placeholder="e.g. MH01AB1234"
								value={vehicle}
								onChange={(e) => setVehicle(e.target.value.toUpperCase())}
							/>
							<Input
								label="Engine number"
								placeholder="Engine number"
								value={engineNumber}
								onChange={(e) => setEngineNumber(e.target.value)}
							/>
							<Input
								label="Chassis number"
								placeholder="Chassis number"
								value={chasisNumber}
								onChange={(e) => setChasisNumber(e.target.value)}
							/>
							<p className="text-xs text-slate-500">
								Tip: match these exactly with your registration certificate.
							</p>
						</CardBody>
						<CardFooter className="flex justify-between">
							<Button variant="ghost" onClick={goBack}>
								<ArrowLeft className="h-5 w-5" /> Back
							</Button>
							<Button onClick={saveVehicle} loading={busy}>
								Continue <ArrowRight className="h-5 w-5" />
							</Button>
						</CardFooter>
					</Card>
				)}

				{/* STEP 3 — Documents */}
				{step === 'documents' && (
					<Card>
						<CardHeader>Upload documents</CardHeader>
						<CardBody className="space-y-4">
							<div className="rounded-xl border-2 border-blue-400 bg-blue-50 p-3 text-sm text-blue-800">
								Upload clear photos of each document. They save automatically as you add them.
							</div>
							<div className="grid gap-4 sm:grid-cols-2">
								{DOC_META.map((m) => (
									<FileDrop
										key={m.key}
										label={m.label}
										hint={m.hint}
										uploadedUrl={docs[m.key].url}
										file={docs[m.key].file}
										loading={docs[m.key].loading}
										onSelect={(f) => onPickDoc(m.key, f)}
										onClear={() =>
											setDocs((prev) => ({ ...prev, [m.key]: { ...prev[m.key], file: null } }))
										}
									/>
								))}
							</div>
						</CardBody>
						<CardFooter className="flex justify-between">
							<Button variant="ghost" onClick={goBack}>
								<ArrowLeft className="h-5 w-5" /> Back
							</Button>
							<Button onClick={goNext} disabled={!docsDone}>
								{docsDone ? 'Go to payment' : 'Upload all to continue'}{' '}
								<ArrowRight className="h-5 w-5" />
							</Button>
						</CardFooter>
					</Card>
				)}

				{/* STEP 4 — Payment */}
				{step === 'pay' && (
					<Card>
						<CardHeader>Choose a bank &amp; pay</CardHeader>
						<CardBody className="space-y-5">
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
								<Clock className="h-4 w-4" /> You'll set your delivery address right after payment.
							</p>
						</CardBody>
						<CardFooter className="flex justify-between">
							<Button variant="ghost" onClick={goBack}>
								<ArrowLeft className="h-5 w-5" /> Back
							</Button>
							<Button onClick={startPayment} loading={payment.loading} size="lg">
								Pay ₹{price} <ArrowRight className="h-5 w-5" />
							</Button>
						</CardFooter>
					</Card>
				)}

				{/* STEP 5 — Delivery address */}
				{step === 'address' && (
					<div className="space-y-4">
						<div className="rounded-xl border-2 border-emerald-500 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
							Payment received 🎉 Where should we deliver your FASTag?
						</div>
						{appId ? (
							<DeliveryLocationForm
								applicationId={appId}
								onSuccess={goNext}
							/>
						) : (
							<Card>
								<CardBody className="py-8 text-center text-slate-600">
									We couldn't find your application reference. Please reopen it from{' '}
									<button
										className="font-semibold text-blue-600 underline"
										onClick={() => navigate('/my-application')}
									>
										My applications
									</button>
									.
								</CardBody>
							</Card>
						)}
					</div>
				)}

				{/* STEP 6 — Done */}
				{step === 'done' && (
					<Card>
						<CardBody className="space-y-5 py-10 text-center">
							<span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border-2 border-slate-900 bg-emerald-400 brand-shadow-md">
								<PartyPopper className="h-8 w-8 text-slate-900" strokeWidth={2.5} />
							</span>
							<h2 className="font-display text-3xl font-extrabold text-slate-900">You're all set!</h2>
							<p className="mx-auto max-w-md text-slate-600">
								Your FASTag application is complete and your delivery address is saved. We'll review your
								documents and deliver your FASTag to your doorstep.
							</p>
							<div className="flex flex-wrap justify-center gap-3">
								<Button variant="secondary" onClick={() => navigate('/my-application')}>
									View my applications
								</Button>
								{appId && (
									<Button onClick={() => navigate(`/status/${appId}`)}>Track application</Button>
								)}
							</div>
						</CardBody>
					</Card>
				)}
			</div>
		</div>
	);
}
