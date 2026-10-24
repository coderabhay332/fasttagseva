import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../stores';
import React from 'react';

export default function AdminRoute() {
	const { accessToken, user } = useAppSelector(s => s.auth);
	const location = useLocation();
	if (!accessToken) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}
	if (user?.role !== 'ADMIN') {
		return <Navigate to="/onboarding" replace />;
	}
	return <Outlet />;
}


