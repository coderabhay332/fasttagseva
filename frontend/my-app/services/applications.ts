import api from './api';

export type ServiceType =
	| 'NEW_FASTAG'
	| 'REPLACEMENT_FASTAG'
	| 'COMMERCIAL_FASTAG'
	| 'KYC_KYV'
	| 'ANNUAL_PASS'
	| 'BLACKLIST_HOTLIST'
	| 'VRN_UPDATE'
	| 'E_NOTICE'
	| 'TAG_CLOSURE';

export interface CreateApplicationPayload {
	serviceType?: ServiceType;
	vehicle: string;
	engineNumber?: string;
	chasisNumber?: string;
	notes?: string;
}

export const createApplication = (payload: CreateApplicationPayload) =>
	api.post('/applications/create', payload);

export const getMyApplications = () => api.get('/applications/my-application');
export const getApplicationById = (id: string) => api.get(`/applications/${id}`);
export const updateApplication = (id: string, payload: Partial<CreateApplicationPayload>) =>
	api.put(`/applications/update/${id}`, payload);

// Admin-only
export const getAllApplications = () => api.get('/applications');
export const updateApplicationStatus = (id: string, status: string) => 
    api.put(`/applications/update-status`, { id, status });
export const deleteApplication = (id: string) => api.delete(`/applications/${id}`);
export const getPaymentsByApplication = (applicationId: string, page: number = 1, limit: number = 10) => 
	api.get(`/payments/application/${applicationId}?page=${page}&limit=${limit}`);
export const listMyPayments = (page: number = 1, limit: number = 50) => api.get(`/payments/list?page=${page}&limit=${limit}`);
// Ask the backend to reconcile this application's payments with Razorpay
// (covers a delayed or missed webhook).
export const syncApplicationPayments = (applicationId: string) => api.post('/payments/sync', { applicationId });

export const uploadPan = (id: string, file: File) => {
	const fd = new FormData(); fd.append('file', file);
	return api.post(`/applications/upload-pan/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
}

export const uploadRc = (id: string, file: File) => {
	const fd = new FormData(); fd.append('file', file);
	return api.post(`/applications/upload-rc/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
}

export const uploadVehicleFront = (id: string, file: File) => {
	const fd = new FormData(); fd.append('file', file);
	return api.post(`/applications/upload-vehicle-front/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
}

export const uploadVehicleSide = (id: string, file: File) => {
	const fd = new FormData(); fd.append('file', file);
	return api.post(`/applications/upload-vehicle-side/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
}


