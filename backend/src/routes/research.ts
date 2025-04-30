import { Hono, type Context } from 'hono';
import { check_cookies } from "../utils/jwt.ts";
import { Tag } from "../db_objects/tags.ts";
import { User } from "../db_objects/user.ts";
import { UserType } from "../types/user.ts";

const app = new Hono();

// filter: by one or multiple tags / location / fame rate / age
app.get('/:type/:options/', async (c: Context) => {
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 400);
	const { message, ret_val, user } = ret_check;
	if (user == null || message != undefined)
		return c.json({ message: message }, ret_val);

	const type = c.req.param('type');
	const options = c.req.param('options');
	let user_list_serialized: UserType[] | undefined;

	if (type == undefined || options == undefined)
		return c.json({ message: 'Bad request' }, 400);
	if (type != 'tags' && type != 'location' && type != 'fame_rate')
		return c.json({ message: 'Bad request' }, 400);
	if (type == 'tags') {
		const tags = options.split(',');
		for (const tag of tags) {
			console.log(tag);
			if (!(await Tag.tag_exists(tag)))
					return c.json({ message: 'Tag does not exist' }, 400);
		}
		user_list_serialized = await Promise.all((await Tag.get_user_by_tags(tags, user.id))
		.map(async (user_id: number) => {
			const user = await User.get_by_id(user_id);
			return await user.serialize();
		}));
	}
	else if (type == 'location') {
		const radius = Number(options);
		user_list_serialized = await Promise.all((await user.get_all_by_loc(radius))
		.map(async (user: User) => {
			return await user.serialize();
		}));
	}
	if (user_list_serialized == undefined || user_list_serialized.length == 0)
		return c.json({ message: 'No users found' }, 404);
	return c.json({ message: 'Users found', users: user_list_serialized }, 200);
});

export default app;