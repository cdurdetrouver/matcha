import { Hono, type Context } from 'hono';
import { check_cookies } from '../utils/jwt.ts';
import { Tag } from '../db_objects/tags.ts';
import { User } from '../db_objects/user.ts';

const app = new Hono();

app.post('/all', async (c: Context) => {
	const { lat, long, radius, tags, fame_rate, minAge, maxAge, username } =
		await c.req.json();
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 400);
	const { message, ret_val, user } = ret_check;
	if (user == null || message != undefined)
		return c.json({ message: message }, ret_val);

	const user_lists: User[][] = [];

	if (lat != undefined || long != undefined || radius != undefined)
		user_lists.push(await user.get_all_by_loc(radius, long, lat));
	if (tags != undefined && tags.length != 0) {
		for (const tag of tags) {
			if (!(await Tag.tag_exists(tag)))
				return c.json({ message: 'Tag does not exist' }, 400);
		}	
		user_lists.push(await Tag.get_user_by_tags(tags, user.id));
	}
	if (username != undefined) {
		const users = await user.get_by_username_contains(username);
		user_lists.push(users);
	}
	if (fame_rate != undefined) {
		if (fame_rate < 0 || fame_rate > 1)
			return c.json(
				{ message: 'Fame rate must be between 0 and 1' },
				400
			);
		user_lists.push(
			await user.get_all_by_famerate(
				fame_rate,
				fame_rate === 1 ? 1 : fame_rate + 0.1
			)
		);
	}
	if (minAge != undefined && maxAge != undefined) {
		if (minAge < 0 || maxAge < 0 || minAge > maxAge)
			return c.json(
				{
					message:
						'Age must be positive and minAge must be less than maxAge',
				},
				400
			);
		user_lists.push(await user.get_all_by_age(minAge, maxAge));
	}

	let users_list: User[];
	if (user_lists.length == 0)
		return c.json({ message: 'No users found' }, 200);
	if (user_lists.length == 1) {
		users_list = user_lists[0];
	} else {
		users_list = user_lists.reduce((acc, list) => {
			const ids = new Set(list.map((u) => u.id));
			return acc.filter((u) => ids.has(u.id));
		});
	}
	users_list = users_list.filter((u) => u.id != user.id);
	if (users_list.length == 0)
		return c.json({ message: 'No users found' }, 200);
	const users_list_s = await Promise.all(
		users_list.map(async (user) => await user.serialize())
	);
	return c.json({ message: 'Users found', users: users_list_s }, 200);
});

app.all('/all', (c: Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405);
});

app.notFound((c: Context) => {
	return c.json({ message: 'Route not Found' }, 404);
});

export default app;
