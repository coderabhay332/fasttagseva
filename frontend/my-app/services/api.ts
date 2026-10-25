import axios from 'axios';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
	baseURL: API_BASE_URL,
	timeout: 30000, // 30 second timeout
});

// Log API URL in development
if (import.meta.env.DEV) {
	console.log('API Base URL:', API_BASE_URL);
}

// Attach Authorization header if token exists
api.interceptors.request.use((config) => {
	const stored = localStorage.getItem('auth');
	if (stored) {
		try {
			const { accessToken } = JSON.parse(stored) as { accessToken?: string };
			if (accessToken) {
				config.headers = (config.headers || {}) as any;
				config.headers.Authorization = `Bearer ${accessToken}`;
			}
		} catch {}
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		// Log detailed error for debugging
		console.error('API Error:', {
			message: error?.message,
			code: error?.code,
			status: error?.response?.status,
			statusText: error?.response?.statusText,
			data: error?.response?.data,
			url: error?.config?.url,
			method: error?.config?.method,
		});
		
		// Request body rejected as too large. The proxy (nginx/CloudFront) may
		// return this with no CORS headers, surfacing as ERR_NETWORK below, but
		// when the status does come through we give a precise message.
		if (error?.response?.status === 413) {
			return Promise.reject({
				success: false,
				message: 'The file is too large to upload. Please choose a smaller image (under 8 MB).',
				status: 413,
			});
		}

		// Request exceeded the client timeout.
		if (error.code === 'ECONNABORTED') {
			return Promise.reject({
				success: false,
				message: 'The upload timed out. Please check your connection and try a smaller image.',
				status: 0,
			});
		}

		// Handle CORS or network errors
		if (error.code === 'ERR_NETWORK') {
			return Promise.reject({
				success: false,
				message: 'Unable to reach the server. This can happen if the file is too large or your connection dropped. Please try a smaller image or check your internet connection.',
				status: 0,
			});
		}
		
		// Handle HTTP errors with response data
		if (error?.response?.data) {
			return Promise.reject({
				success: false,
				message: error.response.data.message || error.response.data.error || 'Request failed',
				error: error.response.data.error,
				details: error.response.data.details,
				status: error.response.status,
			});
		}
		
		return Promise.reject({
			success: false,
			message: error?.message || 'Network error',
			status: error?.response?.status,
		});
	}
);

export default api;


