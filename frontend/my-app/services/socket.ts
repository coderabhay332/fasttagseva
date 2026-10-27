import { io, Socket } from 'socket.io-client';

/**
 * Real-time transaction socket client.
 *
 * Connects to the backend Socket.IO server and authenticates with the same
 * JWT access token used for REST requests (stored under `auth` in
 * localStorage). The backend places the connection into a per-user room and
 * emits `transaction:created` / `transaction:update` events for that user's
 * Razorpay transactions.
 */

export interface TransactionEvent {
	paymentId: string;
	orderId: string;
	paymentStatus: string;
	amount?: number;
	currency?: string;
	paymentMethod?: string;
	applicationId?: string;
	bankName?: string;
	paymentDate?: string | null;
	updatedAt?: string;
}

// Derive the socket origin from the API URL. VITE_API_URL points at ".../api";
// the socket server lives at the origin root, so strip a trailing "/api".
// An explicit VITE_SOCKET_URL always wins if provided.
const resolveSocketUrl = (): string => {
	const explicit = import.meta.env.VITE_SOCKET_URL as string | undefined;
	if (explicit) return explicit;

	const apiUrl = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:5000/api';
	return apiUrl.replace(/\/api\/?$/, '');
};

const getAccessToken = (): string | undefined => {
	const stored = localStorage.getItem('auth');
	if (!stored) return undefined;
	try {
		const { accessToken } = JSON.parse(stored) as { accessToken?: string };
		return accessToken;
	} catch {
		return undefined;
	}
};

let socket: Socket | null = null;

/**
 * Get (creating if needed) the shared socket instance. Returns null when the
 * user is not authenticated, since the handshake would be rejected anyway.
 */
export const getSocket = (): Socket | null => {
	const token = getAccessToken();
	if (!token) return null;

	if (socket) return socket;

	socket = io(resolveSocketUrl(), {
		path: '/socket.io',
		auth: { token },
		transports: ['websocket', 'polling'],
		autoConnect: true,
		reconnection: true,
		reconnectionAttempts: 5,
		reconnectionDelay: 1000,
	});

	if (import.meta.env.DEV) {
		socket.on('connect', () => console.log('Socket connected:', socket?.id));
		socket.on('connect_error', (err) => console.warn('Socket connect error:', err.message));
		socket.on('disconnect', (reason) => console.log('Socket disconnected:', reason));
	}

	return socket;
};

/** Disconnect and clear the shared socket (e.g. on logout). */
export const disconnectSocket = (): void => {
	if (socket) {
		socket.disconnect();
		socket = null;
	}
};
