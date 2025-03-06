import type { PageLoad } from './path/to/other/module';

export const load: PageLoad = async ({locals}) => {
	const user = locals.user;
	return {
		user : user
	}
};
