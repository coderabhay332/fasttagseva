import React, { type SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
	label?: string;
	error?: string;
	children: React.ReactNode;
}

export default function Select({ 
	className = '', 
	label, 
	error, 
	children,
	...props 
}: SelectProps) {
	return (
		<div className="space-y-2">
			{label && (
				<label className="block text-sm font-bold text-slate-900 mb-2">
					{label}
				</label>
			)}
			<div className="relative">
				<select
					className={`
						block w-full rounded-xl border-2 border-slate-900 bg-white px-4 py-3 text-base
						transition-shadow appearance-none
						focus:outline-none focus:brand-shadow focus:ring-2 focus:ring-yellow-400
						${error ? 'border-red-500 focus:ring-red-400' : ''}
						${className}
					`}
					{...props}
				>
					{children}
				</select>
				{/* Custom dropdown arrow */}
				<div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
					<svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
					</svg>
				</div>
			</div>
			{error && (
				<p className="text-sm font-medium text-red-600 mt-1">{error}</p>
			)}
		</div>
	);
}