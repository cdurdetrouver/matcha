import { PUBLIC_BACKEND_HOST } from '$env/static/public';
import { PUBLIC_WEBSOCKET_HOST } from '$env/static/public';
import type { User } from '$lib/types/user';
import { DeleteCookie, SetCookie } from './cookies';

export async function logoutUser() {
	await fetch(`${PUBLIC_BACKEND_HOST}/api/user/logout`, {
		method: 'DELETE',
		credentials: 'include'
	});
	DeleteCookie('user');
}

export async function refreshToken() {
	const res = await fetch(`${PUBLIC_BACKEND_HOST}/api/user/refresh_token`, {
		method: 'GET',
		credentials: 'include'
	});
	if (!res.ok) {
		await logoutUser();
	}
	return res;
}

export async function request(
	path: string,
	params?: RequestInit,
	logout_on_fail?: boolean
): Promise<Response> {
	try {
		if (params) {
			params.credentials = 'include';
		}
		let response = await fetch(`${PUBLIC_BACKEND_HOST}${path}`, params);

		if (response.status === 401) {
			console.warn('Unauthorized access. Status: 401. Retrying with refresh token...');
			await refreshToken();
			response = await fetch(`${PUBLIC_BACKEND_HOST}${path}`, params);
		}

		if (!response.ok) {
			console.warn(`HTTP error! status: ${response.status}`);
			if (logout_on_fail) {
				logoutUser();
				throw new Error('User logged out due to failed request');
			}
		}

		return response;
	} catch (error) {
		console.error('Error in request:', error);
		return new Response(null, { status: 500, statusText: 'Internal Server Error' });
	}
}

export async function update_user(user?: User) {
	DeleteCookie('user');
	if (!user) {
		const res = await request(
			'/api/user/me',
			{
				method: 'GET',
				credentials: 'include'
			},
			true
		);

		if (!res.ok) {
			console.warn('Failed to update user data');
		}

		const data = await res.json();
		user = data.user as User;
	}
	SetCookie('user', JSON.stringify(user), 5);
	await refreshToken();
	return user;
}

export class WebSocketManager {
	private socket: WebSocket | null = null;
	private url: string;
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private noRetry = false;

	private onOpenHook: (() => void) | null = null;
	private onCloseHook: (() => void) | null = null;
	private onErrorHook: ((error: Event) => void) | null = null;
	private onMessageHook: ((data: any) => void) | null = null;

	constructor(endpoint: string) {
		this.url = `${PUBLIC_WEBSOCKET_HOST}${endpoint}`;
		this.connect();
	}

	private connect() {
		this.socket = new WebSocket(this.url);

		this.socket.onopen = () => {
			console.log('WebSocket connection established:', this.url);
			this.reconnectAttempts = 0;
			if (this.onOpenHook) this.onOpenHook();
		};

		this.socket.onmessage = (event) => {
			if (event.data === 'WebSocket connection opened') return;

			const data = JSON.parse(event.data);
			if (this.onMessageHook) this.onMessageHook(data);
		};

		this.socket.onclose = async (event) => {
			console.warn('WebSocket connection closed:', event);

			if (this.noRetry) return;

			if (this.reconnectAttempts < this.maxReconnectAttempts) {
				this.reconnectAttempts++;
				console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);

				if (this.reconnectAttempts <= 1) {
					const res = await refreshToken();
					if (res.ok) this.connect();
				} else {
					this.connect();
				}
			} else {
				console.error('Max reconnect attempts reached. WebSocket will not reconnect.');
			}

			if (this.onCloseHook) this.onCloseHook();
		};

		this.socket.onerror = (error) => {
			console.error('WebSocket error:', error);
			if (this.onErrorHook) this.onErrorHook(error);
		};
	}

	public send(data: any) {
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.send(JSON.stringify(data));
		} else {
			console.warn('WebSocket is not open. Cannot send message.');
		}
	}

	public close() {
		if (this.socket) {
			this.socket.close();
			this.noRetry = true;
		}
	}

	public setOnOpenHook(hook: () => void) {
		this.onOpenHook = hook;
	}

	public setOnCloseHook(hook: () => void) {
		this.onCloseHook = hook;
	}

	public setOnErrorHook(hook: (error: Event) => void) {
		this.onErrorHook = hook;
	}

	public setOnMessageHook(hook: (data: any) => void) {
		this.onMessageHook = hook;
	}
}
