import React from 'react';
import type { PropsWithChildren } from 'react';

interface CardProps {
	className?: string;
	hover?: boolean;
}

export default function Card({ children, className = '', hover = false }: PropsWithChildren<CardProps>) {
	return (
		<div className={`
			rounded-3xl border-2 border-slate-900 bg-white brand-shadow-lg
			${hover ? 'transition-transform duration-200 hover:-translate-y-1.5' : ''}
			${className}
		`}>
			{children}
		</div>
	);
}

export function CardHeader({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
	return (
		<div className={`border-b-2 border-slate-900 px-8 py-6 ${className}`}>
			<h2 className="font-display text-2xl font-extrabold text-slate-900">{children}</h2>
		</div>
	);
}

export function CardBody({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
	return <div className={`px-8 py-6 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
	return (
		<div className={`border-t-2 border-slate-900 px-8 py-6 bg-amber-50 rounded-b-3xl ${className}`}>
			{children}
		</div>
	);
}