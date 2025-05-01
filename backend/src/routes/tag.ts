import { Hono, type Context } from 'hono';
import { Tag } from '../db_objects/tags.ts';
import { check_cookies } from '../utils/jwt.ts';
import { Tags_Users } from '../db_objects/tags_users.ts';

const app = new Hono();

app.get('/all', async (c: Context) => {
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);

	const tags = await Tag.get_all_tags();
	return c.json(tags, 200);
});

app.all('/all', (c: Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405);
});

app.post('/create', async (c: Context) => {
	const ret_check = await check_cookies(c);
	let { tag_name } = await c.req.json();
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);
	if (tag_name == undefined || !Tag.name_is_valid(tag_name))
		return c.json(
			{ message: 'Tag name should only contain letters _ or -' },
			400
		);
	tag_name = tag_name.toLowerCase();
	if (await Tag.tag_exists(tag_name))
		return c.json({ message: 'Tag already exists' }, 400);
	await Tag.create(tag_name);
	return c.json({ message: 'Tag created' }, 200);
});

app.all('/create', (c: Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405);
});

app.post('/user_tag', async (c: Context) => {
	const ret_check = await check_cookies(c);
	const { tag_name } = await c.req.json();
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);
	if (tag_name == undefined)
		return c.json({ message: 'Tag name is required' }, 400);
	if (!(await Tag.tag_exists(tag_name)))
		return c.json({ message: 'Tag does not exist' }, 400);
	if (await Tags_Users.had_tag(user.id, tag_name))
		return c.json({ message: 'User already has this tag' }, 400);
	await Tags_Users.add_tag(user.id, tag_name);
	return c.json({ message: 'Tag added' }, 200);
});

app.get('/user_tag', async (c: Context) => {
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);
	const tags = await Tags_Users.get_tags(user.id);
	return c.json({ message: 'Found user tags', tags: tags }, 200);
});

app.delete('/user_tag', async (c: Context) => {
	const ret_check = await check_cookies(c);
	let { tag_name } = await c.req.json();
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);
	if (tag_name == undefined)
		return c.json({ message: 'Tag name is required' }, 400);
	tag_name = tag_name.toLowerCase();
	if (!(await Tag.tag_exists(tag_name)))
		return c.json({ message: 'Tag does not exist' }, 400);
	if (!(await Tags_Users.had_tag(user.id, tag_name)))
		return c.json({ message: "User don't had this tag" }, 400);
	await Tags_Users.delete_tag(user.id, tag_name);
	return c.json({ message: 'Tag deleted' }, 200);
});

app.all('/user_tag', (c: Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405);
});

app.notFound((c: Context) => {
	return c.json({ message: 'Route not Found' }, 404);
});

export default app;
