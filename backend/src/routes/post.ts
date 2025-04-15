import { Hono, type Context } from 'hono';
import { check_cookies } from '../utils/jwt.ts';
import { User } from '../db_objects/user.ts';
import { get_list_users } from "../utils/posts.ts";
import { PostType } from "../types/post.ts";
import { Image } from "../db_objects/images.ts";

const app = new Hono();

app.get('/posts', async (c: Context) => {
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);
	const users_list: User[] = await get_list_users(user);
	if (users_list.length == 0)
		return c.json({ message: 'No users to match with' }, 404);
	//make the note and order by it
	const posts_list:PostType[] = [];
	for (let i = 0; i < users_list.length; i++) {
		const images = await Promise.all((await Image.get_post_by_user(
			users_list[i].id)).map(async (image) => await image.serialize()));
		const post:PostType = {
			user: await users_list[i].serialize(),
			posts: images
		}
		posts_list.push(post);
	}
	return c.json({message: 'found posts', posts: posts_list}, 200);
});

app.all('/chats', (c: Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405);
});

export default app;
