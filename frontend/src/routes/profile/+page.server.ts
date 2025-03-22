import type { Actions } from "./$types";
import { redirect } from '@sveltejs/kit';
import { PUBLIC_BACKEND_HOST } from "$env/static/public";

export const actions: Actions = {
	default: async ({ cookies }) => {
		cookies.delete("user", {
			path: "/"
		});

		const res = await fetch(`${PUBLIC_BACKEND_HOST}/api/user/logout`, {
			method: "DELETE"
		});

		throw redirect(302, '/');
	}
};
