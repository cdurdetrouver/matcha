import { Hono, type Context } from 'hono';
import { check_cookies } from "../utils/jwt.ts";
import { Tag } from "../db_objects/tags.ts";

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

	if (type == undefined || options == undefined)
		return c.json({ message: 'Bad request' }, 400);
	if (type != 'tags' && type != 'location' && type != 'fame_rate')
		return c.json({ message: 'Bad request' }, 400);
	if (type == 'tags') {
		const tags = options.split(',');
		for (const tag of tags) {
			if (!(await Tag.tag_exists(tag)))
					return c.json({ message: 'Tag does not exist' }, 400);
		}
		
	}
});

export default app;