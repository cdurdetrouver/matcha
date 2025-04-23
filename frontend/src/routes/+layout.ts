export const prerender = true;

import { redirect } from '@sveltejs/kit';
import { GetCookie } from '$lib/script/cookies';
import type { LayoutLoad } from './$types';

const publicPaths = ['/', '/login', '/verif'];
const publicCompletePaths = [...publicPaths, '/complete', '/profile'];

function isPathAllowed(path: string, paths = publicPaths): boolean {
	return paths.some((allowedPath) => path === allowedPath || path.startsWith(allowedPath + '/'));
}

export const load: LayoutLoad = async ({ url }) => {
	if (typeof document === 'undefined') {
		return { user: null };
	}
	const currentPath = url.pathname;

	const userCookie = GetCookie('user');

	if (!userCookie) {
		if (!isPathAllowed(currentPath)) {
			throw redirect(307, '/login');
		}
	} else {
		const user = JSON.parse(userCookie);

		if (!user.complete_profile && !isPathAllowed(currentPath, publicCompletePaths)) {
			throw redirect(307, '/complete');
		}
	}

	return {
		user: userCookie ? JSON.parse(userCookie) : null
	};
};
