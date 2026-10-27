import { useEffect, useRef, useState } from 'react';
import { getSocket, type TransactionEvent } from '../services/socket';

export interface UseTransactionSocketOptions {
	/** Fired when a new transaction (payment link) is created. */
	onCreated?: (event: TransactionEvent) => void;
	/** Fired when a transaction status changes (PAID / FAILED / CANCELLED / ATTEMPTED). */
	onUpdate?: (event: TransactionEvent) => void;
	/** Set false to disable the subscription (e.g. when logged out). Defaults to true. */
	enabled?: boolean;
}

/**
 * Subscribe to the current user's real-time Razorpay transaction events.
 *
 * Returns connection state and the most recent event received, and invokes the
 * provided callbacks for each event. Handlers are kept in refs so the socket
 * listeners are attached once and not re-bound on every render.
 */
export function useTransactionSocket(options: UseTransactionSocketOptions = {}) {
	const { onCreated, onUpdate, enabled = true } = options;

	const [connected, setConnected] = useState(false);
	const [lastEvent, setLastEvent] = useState<TransactionEvent | null>(null);

	const onCreatedRef = useRef(onCreated);
	const onUpdateRef = useRef(onUpdate);
	onCreatedRef.current = onCreated;
	onUpdateRef.current = onUpdate;

	useEffect(() => {
		if (!enabled) return;

		const socket = getSocket();
		if (!socket) return;

		setConnected(socket.connected);

		const handleConnect = () => setConnected(true);
		const handleDisconnect = () => setConnected(false);

		const handleCreated = (event: TransactionEvent) => {
			setLastEvent(event);
			onCreatedRef.current?.(event);
		};
		const handleUpdate = (event: TransactionEvent) => {
			setLastEvent(event);
			onUpdateRef.current?.(event);
		};

		socket.on('connect', handleConnect);
		socket.on('disconnect', handleDisconnect);
		socket.on('transaction:created', handleCreated);
		socket.on('transaction:update', handleUpdate);

		return () => {
			socket.off('connect', handleConnect);
			socket.off('disconnect', handleDisconnect);
			socket.off('transaction:created', handleCreated);
			socket.off('transaction:update', handleUpdate);
		};
	}, [enabled]);

	return { connected, lastEvent };
}
