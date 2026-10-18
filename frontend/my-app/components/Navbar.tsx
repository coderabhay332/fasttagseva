import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CarFront } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../stores';
import Button from './ui/Button';
import { logoutThunk } from '../stores/slices/authSlice';

export default function Navbar() {
	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const { user, accessToken } = useAppSelector(s => s.auth);

	const isActive = (path: string) => location.pathname === path;

	const navLinks = [
		{ path: '/create', label: 'Create', show: !!accessToken && user?.role !== 'ADMIN' },
		{ path: '/my-application', label: 'My Applications', show: !!accessToken && user?.role !== 'ADMIN' },
		{ path: '/delivery', label: 'Delivery', show: !!accessToken && user?.role !== 'ADMIN' },
		{ path: '/transactions', label: 'Transactions', show: !!accessToken && user?.role !== 'ADMIN' },
		{ path: '/profile', label: 'Profile', show: !!accessToken },
		{ path: '/admin', label: 'Admin', show: !!accessToken && user?.role === 'ADMIN' },
	];

	const handleLogout = async () => {
		await dispatch(logoutThunk());
		navigate('/login');
	};

	return (
		<nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0B1F4B]/95 backdrop-blur-md">
			<div className="mx-auto max-w-6xl px-6">
				<div className="flex h-16 items-center justify-between">
					{/* Logo */}
					<Link
						to="/"
						className="flex items-center gap-2 transition-transform hover:-translate-y-0.5"
					>
						<div className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-900 bg-yellow-400 shadow-[2px_2px_0_0_#0F172A]">
							<CarFront className="h-5 w-5 text-slate-900" strokeWidth={2.5} />
						</div>
						<span className="font-display text-2xl font-extrabold leading-none text-white">
							Tag<span className="text-yellow-400">Seva</span>
						</span>
					</Link>

					{/* Navigation Links */}
					<div className="hidden md:flex items-center space-x-1">
						{navLinks.filter(link => link.show).map(({ path, label }) => (
							<Link
								key={path}
								to={path}
								className={`
									px-4 py-2 rounded-lg text-sm font-semibold transition-colors
									${isActive(path)
										? 'bg-yellow-400 text-slate-900'
										: 'text-white/80 hover:text-yellow-300'
									}
								`}
							>
								{label}
							</Link>
						))}
					</div>

					{/* Auth Actions */}
					<div className="hidden md:flex items-center">
						{accessToken ? (
							<Button variant="secondary" size="sm" onClick={handleLogout}>
								Logout
							</Button>
						) : (
							<Link
								to="/login"
								className="rounded-xl border-2 border-slate-900 bg-yellow-400 px-4 py-2 text-sm font-bold text-slate-900 shadow-[3px_3px_0_0_#0F172A] transition-transform hover:-translate-y-0.5"
							>
								Login
							</Link>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
}