import type { Notif } from '$lib/types/notif';
import type { PersonalUser } from '$lib/types/user';

export const load = async ({ locals }) => {
	const user: PersonalUser | null = locals.user;

	let notifs: Notif[] = [
		{
			id: 1,
			message: 'You got a new Message from Blast',
			redirect: '/chat/1',
			created_at: 1738981727280
		},
		{
			id: 2,
			message: 'You got a new Message from Jhon Doe 2',
			redirect: '/profile',
			created_at: 1741609727280
		}
	];
	
	return {
		user: user,
		notifs: notifs
	};
};
