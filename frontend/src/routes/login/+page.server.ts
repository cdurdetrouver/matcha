import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const actions = {
	login: async ({ request }) => {
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

        return ({email, success: true, page: "login"});
	},
	register: async ({ request }) => {
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

		return ({email, username, success: true, page: "register"});
	}
} satisfies Actions;
