import { Check } from 'lucide-react';

export interface StepperStep {
	key: string;
	label: string;
}

interface StepperProps {
	steps: StepperStep[];
	/** Zero-based index of the current (active) step. */
	current: number;
}

/**
 * Horizontal progress stepper matching the TagSeva brand (ink borders,
 * yellow accent, hard offset shadows). Completed steps show a check,
 * the active step is highlighted, upcoming steps are muted.
 */
export default function Stepper({ steps, current }: StepperProps) {
	return (
		<div className="w-full">
			{/* Desktop / tablet: full horizontal rail with labels */}
			<ol className="hidden items-center sm:flex">
				{steps.map((step, i) => {
					const isDone = i < current;
					const isActive = i === current;
					return (
						<li key={step.key} className="flex flex-1 items-center last:flex-none">
							<div className="flex flex-col items-center">
								<div
									className={[
										'grid h-10 w-10 place-items-center rounded-full border-2 border-slate-900 font-display text-sm font-extrabold transition-colors',
										isDone ? 'bg-emerald-400 text-slate-900' : '',
										isActive ? 'bg-yellow-400 text-slate-900 brand-shadow' : '',
										!isDone && !isActive ? 'bg-white text-slate-400' : '',
									].join(' ')}
								>
									{isDone ? <Check className="h-5 w-5" strokeWidth={3} /> : i + 1}
								</div>
								<span
									className={[
										'mt-2 max-w-[7rem] text-center text-xs font-semibold leading-tight',
										isActive ? 'text-slate-900' : 'text-slate-500',
									].join(' ')}
								>
									{step.label}
								</span>
							</div>
							{i < steps.length - 1 && (
								<div
									className={[
										'mx-2 h-1 flex-1 rounded-full',
										i < current ? 'bg-emerald-400' : 'bg-slate-200',
									].join(' ')}
								/>
							)}
						</li>
					);
				})}
			</ol>

			{/* Mobile: compact "Step X of Y" + bar */}
			<div className="sm:hidden">
				<div className="mb-2 flex items-center justify-between">
					<span className="font-display text-sm font-extrabold text-slate-900">
						{steps[current]?.label}
					</span>
					<span className="text-xs font-semibold text-slate-500">
						Step {current + 1} of {steps.length}
					</span>
				</div>
				<div className="h-2 w-full overflow-hidden rounded-full border-2 border-slate-900 bg-white">
					<div
						className="h-full bg-yellow-400 transition-all duration-300"
						style={{ width: `${((current + 1) / steps.length) * 100}%` }}
					/>
				</div>
			</div>
		</div>
	);
}
