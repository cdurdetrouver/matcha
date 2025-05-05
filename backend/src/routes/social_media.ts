import { Hono, type Context } from 'hono';
import { check_cookies } from '../utils/jwt.ts';
import { X_BARREER_API_KEY } from "../secret.ts";
import { User } from "../db_objects/user.ts";
import { Image } from "../db_objects/images.ts";
import { delete_file, post_file } from "../utils/google_file.ts";

const app = new Hono();

app.post('/github/:username', async (c: Context) => {
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);
	const { username } = c.req.param();
	if (!username)
		return c.json({ message: 'Missing parameters' }, 400);
	let res = await fetch(`https://api.github.com/users/${username}`);
	if (res.status != 200)
		return c.json({ message: 'Github user not found' }, 404);
	const data = await res.json();
	const { avatar_url } = data;
	if (!avatar_url)
		return c.json({ message: 'Failed to get the profile picture url' }, 404);
	res = await fetch(avatar_url);
	if (res.status != 200 || !res.body)
		return c.json({ message: 'Failed to fetch the profile picture' }, 404);
	const buffer = await res.arrayBuffer();
	const uint8 = new Uint8Array(buffer);
	const contentType = res.headers.get("content-type") || "image/jpeg";
	const file = new File([uint8], 'avatar.jpg', { type: contentType });
	const image = await save_avatar(user, file);
	if (image == 422)
		return c.json({ message: 'Failed to save the profile picture' }, 422);
	return c.json({ message: 'Update profile picture with github pp'}, 200);
});

app.post('/x/:username', async (c: Context) => {
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);
	const { username } = c.req.param();
	if (!username)
		return c.json({ message: 'Missing parameters' }, 400);
	const headers = new Headers({
		"Authorization": `Bearer ${X_BARREER_API_KEY}`
	});
	let res = await fetch(`https://api.twitter.com/2/users/by/username/${username}?user.fields=profile_image_url`, { headers });
	if (res.status != 200)
		return c.json({ message: 'X user not found' }, 404);
	const data = (await res.json()).data;
	const { profile_image_url } = data;
	if (!profile_image_url)
		return c.json({ message: 'Failed to get the profile picture url' }, 404);
	res = await fetch(profile_image_url);
	if (res.status != 200 || !res.body)
		return c.json({ message: 'Failed to fetch the profile picture' }, 404);
	const buffer = await res.arrayBuffer();
	const uint8 = new Uint8Array(buffer);
	const contentType = res.headers.get("content-type") || "image/jpeg";
	const file = new File([uint8], 'avatar.jpg', { type: contentType });
	const image = await save_avatar(user, file);
	if (image == 422)
		return c.json({ message: 'Failed to save the profile picture' }, 422);
	return c.json({ message: 'Update profile picture with X pp'}, 200);
});

async function save_avatar(user:User, file: File) {
	const name = user.username + '_avatar';
	let image;
	try {
		image = await Image.get_avatar_by_user(user.id);
		if (!image.filename.endsWith('_default'))
			await delete_file(image.filename);
		await Image.delete_by_id(image.id);
		await post_file(name, file);
		image = await Image.post(user.id, name, 'avatar');
	} catch (e) {
		if (e instanceof Error && e.message === 'Avatar not found')
			image = await Image.post(user.id, name, 'avatar');
		else return (422);
	}
	return (image);
}

export default app;