import { User } from '../db_objects/user.ts';

export async function get_list_users(user: User): Promise<User[]> {
	const list_user = [];
	while(list_user.length < 5) {

		const res = await user.get_all_by_loc(10);
		//delete user already saw
		for (let i = 0; i < list_user.length; i++) {
			//if res.id is not in viewed_users
			list_user.push(res[i]);
		}
	}
	return list_user;
}