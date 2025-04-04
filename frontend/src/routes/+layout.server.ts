import type { User } from '$lib/types/user.js';

export const load = async ({ locals }) => {
	const user: User | null = locals.user;

	return {
		user: user
	};
};
