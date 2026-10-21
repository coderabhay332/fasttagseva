import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import React from 'react';
type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: Variant;
	size?: Size;
	loading?: boolean;
}

const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-bold font-display border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0';

const variants: Record<Variant, string> = {
	primary: 'bg-yellow-400 text-slate-900 border-slate-900 brand-shadow hover:brand-shadow-md',
	secondary: 'bg-white text-slate-900 border-slate-900 brand-shadow hover:brand-shadow-md',
	danger: 'bg-red-500 text-white border-slate-900 brand-shadow hover:brand-shadow-md',
	ghost: 'bg-transparent text-slate-900 border-transparent shadow-none hover:bg-slate-900/5 hover:translate-y-0',
	outline: 'bg-transparent border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white',
};

const sizes: Record<Size, string> = {
	sm: 'px-4 py-2 text-sm',
	md: 'px-6 py-3 text-base',
	lg: 'px-8 py-4 text-lg',
};

export default function Button({ 
	variant = 'primary', 
	size = 'md', 
	loading = false,
	className = '', 
	children, 
	disabled,
	...props 
}: PropsWithChildren<ButtonProps>) {
	return (
		<button 
			className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} 
			disabled={disabled || loading}
			{...props}
		>
			{loading && (
				<svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
					<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
			)}
			{children}
		</button>
	);
}