import React, { type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	icon?: React.ReactNode;
	rightIcon?: React.ReactNode;
}

export default function Input({ 
	className = '', 
	label, 
	error, 
	icon,
	rightIcon,
	...props 
}: InputProps) {
	return (
		<div className="space-y-2">
			{label && (
				<label className="block text-sm font-bold text-slate-900 mb-2">
					{label}
				</label>
			)}
			<div className="relative">
				{icon && (
					<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
						{icon}
					</div>
				)}
				<input
					className={`
						block w-full rounded-xl border-2 border-slate-900 bg-white px-4 py-3 text-base
						placeholder-slate-400 transition-shadow
						focus:outline-none focus:brand-shadow focus:ring-2 focus:ring-yellow-400
						${icon ? 'pl-12' : ''}
						${rightIcon ? 'pr-12' : ''}
						${error ? 'border-red-500 focus:ring-red-400' : ''}
						${className}
					`}
					{...props}
				/>
				{rightIcon && (
					<div className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500">
						{rightIcon}
					</div>
				)}
			</div>
			{error && (
				<p className="text-sm font-medium text-red-600 mt-1">{error}</p>
			)}
		</div>
	);
}