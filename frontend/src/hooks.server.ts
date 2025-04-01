import { redirect, type Handle } from '@sveltejs/kit';
import type { User } from '$lib/types/user';

const public_paths = ['/', '/login'];

function isPathAllowed(path: string) {
	return public_paths.some(
		(allowedPath) => path === allowedPath || path.startsWith(allowedPath + '/')
	);
}

export const handle: Handle = async ({ event, resolve }) => {
	const user_cookie = event.cookies.get('user');

	const url = new URL(event.request.url);

	if (!user_cookie) {
		if (!isPathAllowed(url.pathname)) throw redirect(302, '/login');
		else return resolve(event);
	}

	const user: User | null = JSON.parse(user_cookie);

	event.locals.user = user;

	if (!user || !user.completed) {
		if (!isPathAllowed(url.pathname)) throw redirect(302, '/complete');
		else return resolve(event);
	}

	return resolve(event);
};
