export const prerender = true;

import { redirect } from '@sveltejs/kit';
import { GetCookie, SetCookie } from '$lib/script/cookies';
import type { LayoutLoad } from './$types';
import { request } from '$lib/script/request';

const publicPaths = ['/', '/login', '/verif', '/reset_pass'];
const publicCompletePaths = [...publicPaths, '/complete', '/user'];

function isPathAllowed(path: string, paths = publicPaths): boolean {
	return paths.some((allowedPath) => path === allowedPath || path.startsWith(allowedPath + '/'));
}

export const load: LayoutLoad = async ({ url }) => {
	if (typeof document === 'undefined') {
		return { user: null };
	}

	const currentPath = url.pathname;
	const userCookie = GetCookie('user');

	if (userCookie) {
		return handleUserFromCookie(userCookie, currentPath);
	}

	return await handleUserFromApi(currentPath);
};

function handleUserFromCookie(userCookie: string, currentPath: string) {
	const user = JSON.parse(userCookie);

	if (!user.complete_profile && !isPathAllowed(currentPath, publicCompletePaths)) {
		throw redirect(307, '/complete');
	}

	return { user };
}

async function handleUserFromApi(currentPath: string) {
	const res = await request(
		'/api/user/me',
		{
			method: 'GET',
			credentials: 'include'
		},
		true
	);

	if (!res.ok) {
		if (!isPathAllowed(currentPath)) {
			throw redirect(307, '/login');
		}
		return { user: null };
	}

	const data = await res.json();
	const user = data.user;

	SetCookie('user', JSON.stringify(user), 60 * 60 * 24);

	if (!user.complete_profile && !isPathAllowed(currentPath, publicCompletePaths)) {
		throw redirect(307, '/complete');
	}

	return { user };
}
