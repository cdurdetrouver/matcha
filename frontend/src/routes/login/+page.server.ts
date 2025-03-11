import type { PersonalUser } from '$lib/types/user';
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, '/profile');
	}
}

export const actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email');
		const password = data.get('password');

		if (!email || !password) {
			return fail(400, {
				missing_email: !email,
				missing_password: !password,
				email,
				page: "login"
			});
		}

		const user: PersonalUser = {
			email: email.toString(),
			username: "cdurdetrouver",
			id: 1,
			created_at: Date.now(),
			avatar: "user.jpeg"
		}

		cookies.set(
			'user', JSON.stringify(user),
			{
				path: '/',
				maxAge: 60 * 60 * 24 * 365,	
				httpOnly: false,
			},
		);

		throw redirect(302, '/profile');
	},
	register: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email');
		const username = data.get('username');
		const password = data.get('password');
		const password_verif = data.get('password-verif');

		if (!email || !username || !password || !password_verif) {
			return fail(400, { 
				missing_email: !email,
				missing_username: !username, 
				missing_password: !password,
				missing_match: !password_verif, 
				email, 
				username,
				page: "register"
			});
		}

		if (password !== password_verif) {
			return fail(400, { 
				incorrect_match: "Passwords don't match", 
				email, 
				username,
				page: "register"
			});
		}

		const user: PersonalUser = {
			email: email.toString(),
			username: username.toString(),
			id: 1,
			created_at: Date.now(),
			avatar: "user.jpeg"
		}

		cookies.set(
			'user', JSON.stringify(user),
			{
				path: '/',
				maxAge: 60 * 60 * 24 * 365,	
				httpOnly: false,
			},
		);

		throw redirect(302, '/profile');
	}
} satisfies Actions;
