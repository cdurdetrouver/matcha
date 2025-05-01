import { Hono, type Context } from 'hono';
import { check_cookies } from "../utils/jwt.ts";
import { Tag } from "../db_objects/tags.ts";
import { User } from "../db_objects/user.ts";
import { UserType } from "../types/user.ts";

const app = new Hono();
//multiple tags at the same time
// filter: by one or multiple tags / location / fame rate / age
app.get('/', async (c: Context) => {
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 400);
	const { message, ret_val, user } = ret_check;
	if (user == null || message != undefined)
		return c.json({ message: message }, ret_val);

	const body = await c.req.json();
	const options = c.req.param('options');
	let user_list_serialized: UserType[] | undefined;

	if (body == undefined)
		return c.json({ message: 'Bad request' }, 400);
	const {lat, long, radius, tags, fame_rate, minAge, maxAge} = body;
	if (lat == undefined || long == undefined || radius == undefined) {
		const radius = Number(options);
		const user_list_loc = await user.get_all_by_loc(radius);
	}
	if (tags != undefined && tags.length != 0) {
		const tags = options.split(',');
		for (const tag of tags) {
			console.log(tag);
			if (!(await Tag.tag_exists(tag)))
					return c.json({ message: 'Tag does not exist' }, 400);
		}
		const user_list_tags = await Promise.all((await Tag.get_user_by_tags(tags, user.id))
		.map(async (user_id: number) => {
			const user = await User.get_by_id(user_id);
			return await user.serialize();
		}));
	}
	if (fame_rate != undefined) {
		if (fame_rate < 0 || fame_rate > 1)
			return c.json({ message: 'Fame rate must be between 0 and 1' }, 400);
		//const user_list_fame = await user.get_all_by_fame_rate(fame_rate);
	}
	if (minAge != undefined && maxAge != undefined) {
	}
		//return c.json({ message: 'No users found' }, 404);
	return c.json({ message: 'Users found', users: user_list_serialized }, 200);
});

export default app;