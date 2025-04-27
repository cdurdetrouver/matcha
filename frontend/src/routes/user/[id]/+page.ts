import { redirect } from '@sveltejs/kit';

export const load = async ({ params, parent }) => {
	if (typeof document === 'undefined') {
		return { userid: null };
	}
	const { user } = await parent();
	const id = Number(params.id);
	if (user.id == id) {
		throw redirect(307, '/user');
	}
	return {
		userid: id
	};
};
