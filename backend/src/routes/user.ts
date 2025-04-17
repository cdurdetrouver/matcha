import { Hono, type Context } from 'hono';
import {
	hashSync,
	genSaltSync,
} from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';
import { user_match, user_check, check_password, get_info_loc } from '../utils/user.ts';
import { getCookie, deleteCookie } from 'hono/cookie';
import {
	get_access_token,
	get_refresh_token,
	verify_token,
	check_cookies,
} from '../utils/jwt.ts';
import { Chats_Users } from '../db_objects/chats_users.ts';
import { Chat } from '../db_objects/chats.ts';
import { User } from '../db_objects/user.ts';
import { Block_Users } from '../db_objects/block_users.ts';
import { ChatType } from '../types/chat.ts';
import { Image } from '../db_objects/images.ts';
import { delete_file, post_file } from '../utils/google_file.ts';
import { Email_Verif } from '../db_objects/email_verif.ts';
import { FRONTEND_URL } from '../secret.ts';
import { sendVerificationEmail } from '../utils/send_mail.ts';
import { Seen_Users } from "../db_objects/seen_users.ts";
import { Loved_Users } from "../db_objects/loved_users.ts";
import { Friendly_Users } from "../db_objects/friendly_users.ts";

const app = new Hono();

app.get('/chats', async (c: Context) => {
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);

	const chats_ids = await Chats_Users.get_chats_by_user(user.id);
	const chats = await Chat.get_all_by_ids(chats_ids);
	const chats_serialize: ChatType[] = await Promise.all(
		chats.map(async (chat: Chat) => await chat.serialize())
	);
	return c.json(
		{ message: 'User chats found !', chats: chats_serialize },
		200
	);
});

app.all('/chats', (c: Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405);
});

app.post('/password', async (c: Context) => {
	const ret_check = await check_cookies(c);
	const { password } = await c.req.json();
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);
	const [valid, ret_message] = check_password(password, user.username);
	if (!valid) return c.json({ message: ret_message }, 401);
	const saltRounds = genSaltSync(12);
	const hash_pass = hashSync(password, saltRounds);
	user.password = hash_pass;
	await user.save();
	return c.json({ message: 'Password successfully changed' }, 200);
});

app.all('/password', (c: Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405);
});

app.delete('/logout', async (c: Context) => {
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);

	user.connected_at = BigInt(Date.now());
	await user.save();
	deleteCookie(c, `access_token`);
	deleteCookie(c, `refresh_token`);
	return c.json({ message: 'User logged out!' }, 200);
});

app.all('/logout', (c: Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405);
});

app.get('/refresh_token', async (c: Context) => {
	const refresh_token = getCookie(c, 'refresh_token');
	let user_info: User;

	if (!refresh_token)
		return c.json({ message: 'No refresh token provided.' }, 401);

	const tokenResult = await verify_token(refresh_token);
	if (!tokenResult)
		return c.json({ message: 'Acces token provided not valid' }, 401);
	const { message, id_ret, token_type } = tokenResult;
	if (token_type != 'refresh' || id_ret == undefined)
		return c.json({ message: 'Wrong token type provided.' }, 401);
	if (message) return c.json({ message: message }, 401);
	try {
		user_info = await User.get_by_id(Number(id_ret));
	} catch (_e) {
		return c.json({ message: 'User not found !' }, 404);
	}
	const access_token = await get_access_token(user_info);

	deleteCookie(c, `access_token`);
	c.res.headers.append(
		'Set-Cookie',
		`access_token=${access_token}; HttpOnly; Path=/`
	);
	return c.json(
		{ message: 'User logged in!', user: await user_info.serialize_me() },
		200
	);
});

app.all('/refresh_token', (c: Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405);
});

app.post('/login', async (c: Context) => {
	const { email, password } = await c.req.json();

	if (!email || !password)
		return c.json({ message: 'Body not format correctly !' }, 400);
	const { ret_user, err_email, err_password } = await user_match(
		email,
		password
	);

	if (err_email || err_password)
		return c.json({ err_password, err_email }, 401);

	if (ret_user != undefined) {
		if (!ret_user.email_verif)
			return c.json({ message: 'User not verified !' }, 401);
		const access_token = await get_access_token(ret_user);
		const refresh_token = await get_refresh_token(ret_user);

		deleteCookie(c, `access_token`);
		deleteCookie(c, `refresh_token`);
		c.res.headers.append(
			'Set-Cookie',
			`access_token=${access_token}; HttpOnly; Path=/`
		);
		c.res.headers.append(
			'Set-Cookie',
			`refresh_token=${refresh_token}; HttpOnly; Path=/`
		);
		return c.json(
			{ message: 'User logged in!', user: await ret_user.serialize_me() },
			200
		);
	}
});

app.all('/login', (c: Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405);
});

app.post('/full_register', async (c: Context) => {
	const body = await c.req.json();
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);
	const { wanted, interests, description, location } = body;
	if (wanted == undefined || interests == undefined)
		return c.json({ message: 'Body not correctly formatted.' }, 422);
	if (wanted >= 1) {
		const { gender, sexual_preferences } = body;
		user.gender = gender;
		user.sexual_preferences = sexual_preferences;
	}
	user.description = description;
	user.interests = interests;
	user.lat, user.long = location;
	if ((await Image.get_post_by_user(user.id)).length < 1)
		return c.json({ message: 'User need at least 1 post' }, 400);
	user.complete_profile = true;
	await user.save();
	return c.json(
		{ message: 'User fully register', user: await user.serialize() },
		200
	);
});

app.all('/full_register', (c: Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405);
});

app.post('/register', async (c: Context) => {
	const { username, email, password } = await c.req.json();

	if (!username || !email || !password)
		return c.json({ message: 'Body not format correctly !' }, 400);
	const saltRounds = genSaltSync(12);
	const { error, err_password, err_username, err_email } = await user_check(
		username,
		email,
		password
	);

	if (error) return c.json({ err_password, err_username, err_email }, 401);

	const hash_pass = hashSync(password, saltRounds);
	const user_register = new User(username, hash_pass, email);
	try {
		await user_register.create();
	} catch (_e) {
		return c.json({ message: 'User creation failed !' }, 422);
	}
	const randomNumber: number = Math.floor(Math.random() * 2);
	const name = 'avatar_default_' + randomNumber;
	await Image.post(user_register.id, name, 'avatar');

	const token = await Email_Verif.create_token(user_register.id);
	const url = `${FRONTEND_URL}/verif?token=${token}&userid=${user_register.id}`;

	try {
		sendVerificationEmail(user_register.email, url);
	} catch (error) {
		return c.json({ message: error }, 422);
	}

	return c.json({ message: 'User created!' }, 200);
});

app.all('/register', (c: Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405);
});

app.post('/verif', async (c: Context) => {
	const { token, userid } = await c.req.json();
	let ret_token = undefined;
	try {
		ret_token = await Email_Verif.get_by_user_id(userid);
		if (ret_token.expiration < Date.now())
			throw new Error('Token expired !');
		if (ret_token.token != token) throw new Error('Token not valid !');
		const user = await User.get_by_id(userid);
		if (user == undefined) throw new Error('User not found !');

		if (user.email_verif) throw new Error('User already verified !');
		user.email_verif = true;
		await user.save();
		await Email_Verif.delete_by_user_id(userid);
		return c.json({ message: 'User verif !' }, 200);
	} catch (error) {
		if (ret_token != undefined) {
			await Email_Verif.delete_by_user_id(userid);
		}
		if (error instanceof Error) return c.json({ message: error }, 422);
		else return c.json({ message: 'You need to register first !' }, 422);
	}
});

app.all('/verif', (c: Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405);
});

app.put('/:id', async (c: Context) => {
	const body = await c.req.json();
	const id = Number(c.req.param('id'));
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 400);
	const { message, ret_val, user } = ret_check;
	if (user == null || message != undefined)
		return c.json({ message: message }, ret_val);
	if (user.id != id) return c.json({ message: 'Not authorized' }, 401);

	user.email = body.email;
	try {
		user.save();
		return c.json(
			{ message: 'User updated!', user: await user.serialize_me() },
			200
		);
	} catch (_e) {
		return c.json({ message: 'User update failed !' }, 422);
	}
});

app.get('/avatar/:id', async (c: Context) => {
	const id = Number(c.req.param('id'));
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);
	let avatar;
	if (isNaN(id)) return c.json({ message: 'User target not found' }, 404);
	try {
		avatar = await Image.get_avatar_by_user(id);
	} catch (_e) {
		return c.json({ message: 'User target not found' }, 404);
	}
	const avatar_serialized = await avatar.serialize();
	return c.json(
		{ message: 'Avatar found !', avatar: avatar_serialized },
		200
	);
});

app.post('/avatar', async (c: Context) => {
	const ret_check = await check_cookies(c);
	const body = await c.req.parseBody();
	let image_serialized;

	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);
	if (body['avatar'] == undefined || !(body['avatar'] instanceof File))
		return c.json({ message: 'Failed to retrieved the image' }, 422);
	const file: File = body['avatar'];
	if (!(file.type.split('/')[0] === 'image'))
		return c.json({ message: 'Bad file' }, 422);
	const name = user.username + '_avatar';
	let image;
	try {
		image = await Image.get_avatar_by_user(user.id);
		if (image.filename.includes('default'))
			await delete_file(image.filename);
		await Image.delete_by_id(user.id);
		await post_file(name, file);
		image = await Image.post(user.id, name, 'avatar');
		image_serialized = await image.serialize();
	} catch (e) {
		if (e instanceof Error && e.message === 'Avatar not found')
			image = await Image.post(user.id, name, 'avatar');
		else return c.json({ message: 'Failed to save the image' }, 422);
	}
	return c.json({ message: 'Image saved !', image: image_serialized }, 200);
});

app.delete('/image/:id', async (c: Context) => {
	const id = Number(c.req.param('id'));
	const ret_check = await check_cookies(c);

	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);

	try {
		const image = await Image.get_by_id(id);
		if (image.user_id != user.id)
			return c.json({ message: 'Trying to do bad things' }, 401);
		await delete_file(image.filename);
		await Image.delete_by_id(id);
	} catch (_e) {
		return c.json({ message: 'Image not found' }, 404);
	}
	return c.json({ message: 'Images succesfully deleted !' }, 200);
});

app.get('/image/:id', async (c: Context) => {
	const id = Number(c.req.param('id'));
	const ret_check = await check_cookies(c);
	let user_get: User;

	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);
	try {
		user_get = await User.get_by_id(id);
	} catch (_e) {
		return c.json({ message: 'User target not found' }, 404);
	}
	const images = await Image.get_post_by_user(user_get.id);
	const images_sarialize = await Promise.all(
		images.map(async (image) => await image.serialize())
	);
	return c.json(
		{ message: 'Images succesfully retrieved !', images: images_sarialize },
		200
	);
});

app.post('/image', async (c: Context) => {
	const ret_check = await check_cookies(c);
	const body = await c.req.parseBody();
	const index = [0, 1, 2, 3, 4];

	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);
	if (body['file'] == undefined || !(body['file'] instanceof File))
		return c.json({ message: 'Failed to retrieved the image' }, 422);
	const file: File = body['file'];
	const { type } = file;
	if (!(type.split('/')[0] === 'image'))
		return c.json(
			{ message: 'Failed to retrieved the image, bad file' },
			422
		);
	const images = await Image.get_post_by_user(user.id);
	if (images.length >= 5)
		return c.json({ message: 'User already had 5 pics.' }, 403);
	let name = user.username + '_' + images.length;
	if (images.filter((image) => image.filename === name)) {
		const index_post = images.map((image) =>
			Number(image.filename.split('_')[1])
		);
		const missing = index.filter((item) => index_post.indexOf(item) < 0);
		name = user.username + '_' + missing[0];
	}
	const image = await Image.post(user.id, name, 'post');
	try {
		await post_file(name, file);
	} catch (_e) {
		return c.json({ message: 'Failed to save the image' }, 422);
	}
	return c.json(
		{ message: 'Image saved !', image: await image.serialize() },
		200
	);
});

app.all('/image', (c: Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405);
});

app.get('/me', async (c: Context) => {
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 400);
	const { message, ret_val, user } = ret_check;
	if (user == null || message != undefined)
		return c.json({ message: message }, ret_val);
	return c.json(
		{ message: 'user found', user: await user.serialize_me() },
		200
	);
});

app.all('/me', (c: Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405);
});

app.get('/:id', async (c: Context) => {
	const id = Number(c.req.param('id'));
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 400);
	const { message, ret_val, user } = ret_check;
	if (user == null || message != undefined)
		return c.json({ message: message }, ret_val);
	let user_info;
	try {
		user_info = await User.get_by_id(id);
	} catch (_e) {
		return c.json({ message: 'User not found' }, 404);
	}
	if (user_info == undefined)
		return c.json({ message: 'User not found' }, 404);
	return c.json(
		{ message: 'user found', user: await user_info.serialize() },
		200
	);
});

app.delete('/:id', async (c: Context) => {
	const id = Number(c.req.param('id'));
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);
	if (user.id != id) return c.json({ message: 'Not authorized' }, 401);

	try {
		await User.delete(id);
		return c.json({ message: 'User Deleted' }, 200);
	} catch (_e) {
		return c.json({ message: 'User deletion failed !' }, 422);
	}
});

app.all('/:id', (c: Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405);
});

app.post('/block_user/:id', async (c: Context) => {
	const id = Number(c.req.param('id'));
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);
	if (user.id != id) return c.json({ message: 'Not authorized' }, 401);

	try {
		await User.get_by_id(id);
		await Block_Users.block_user(user.id, id);
	} catch (e) {
		if (e instanceof Error && e.message === 'User not found')
			return c.json(
				{ message: 'The user you try to blocked does not exists !' },
				404
			);
		else return c.json({ message: 'Error while blocking the user' }, 422);
	}
	return c.json({ message: 'Blocked users list updated' }, 200);
});

app.all('/block_user/:id', (c: Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405);
});

app.delete('/unblock_user/:id', async (c: Context) => {
	const id = Number(c.req.param('id'));
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);
	if (user.id != id) return c.json({ message: 'Not authorized' }, 401);

	try {
		await User.get_by_id(id);
		await Block_Users.delete_block(id, user.id);
	} catch (e) {
		if (e instanceof Error && e.message === 'User not found')
			return c.json(
				{ message: 'The user you try to unblocked does not exists !' },
				404
			);
		else return c.json({ message: 'Error while unblocking the user' }, 422);
	}
	return c.json({ message: 'Blocked users list updated' }, 200);
});

app.all('/unblock_user/:id', (c: Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405);
});

app.post('/seen/:id', async (c: Context) => {
	const id = Number(c.req.param('id'));
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);
	let user_param;
	console.log(user.lat, user.long);
	await get_info_loc(user.lat, user.long);
	try {
		user_param = await User.get_by_id(id);
	}
	catch (_e) {
		return c.json({ message: 'User not found' }, 404);
	}
	if (await Seen_Users.is_user_seen_by(user.id, user_param.id))
		return c.json({ message: 'User already seen' }, 401);
	await Seen_Users.see_user(user.id, user_param.id);
	return c.json({ message: 'User seen list updated, user successfully added' }, 200);
});

app.delete('/seen/:id', async (c: Context) => {
	const id = Number(c.req.param('id'));
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);
	let user_param;
	try {
		user_param = await User.get_by_id(id);
	}
	catch (_e) {
		return c.json({ message: 'User not found' }, 404);
	}
	if (!await Seen_Users.is_user_seen_by(user.id, user_param.id))
		return c.json({ message: 'No user matches' }, 401);
	await Seen_Users.delete_saw(user.id, user_param.id);
	return c.json({ message: 'User seen list updated, user successfully deleted' }, 200);
});

app.post('/loved/:id', async (c: Context) => {
	const id = Number(c.req.param('id'));
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);
	let user_param;
	try {
		user_param = await User.get_by_id(id);
	}
	catch (_e) {
		return c.json({ message: 'User not found' }, 404);
	}
	if (await Loved_Users.is_user_loved_by(user.id, user_param.id))
		return c.json({ message: 'User already loved' }, 401);
	//adding a chat between the two users maybe auto check if the db can auto create it just send a notif
	await Loved_Users.love_user(user.id, user_param.id);
	return c.json({ message: 'User loved list updated, user successfully added' }, 200);
});

app.delete('/loved/:id', async (c: Context) => {
	const id = Number(c.req.param('id'));
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);
	let user_param;
	try {
		user_param = await User.get_by_id(id);
	}
	catch (_e) {
		return c.json({ message: 'User not found' }, 404);
	}
	if (!await Loved_Users.is_user_loved_by(user.id, user_param.id))
		return c.json({ message: 'No user matches' }, 401);
	await Loved_Users.delete_love(user.id, user_param.id);
	return c.json({ message: 'User loved list updated, user successfully deleted' }, 200);
});

app.post('/friend/:id', async (c: Context) => {
	const id = Number(c.req.param('id'));
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);
	let user_param;
	try {
		user_param = await User.get_by_id(id);
	}
	catch (_e) {
		return c.json({ message: 'User not found' }, 404);
	}
	if (await Friendly_Users.is_my_friend(user.id, user_param.id))
		return c.json({ message: 'User already liked' }, 401);
	//adding a chat between the two users maybe auto check if the db can auto create it just send a notif
	await Friendly_Users.make_a_friend(user.id, user_param.id);
	return c.json({ message: 'User friend list updated, user successfully added' }, 200);
});

app.delete('/friend/:id', async (c: Context) => {
	const id = Number(c.req.param('id'));
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);
	let user_param;
	try {
		user_param = await User.get_by_id(id);
	}
	catch (_e) {
		return c.json({ message: 'User not found' }, 404);
	}
	if (!await Friendly_Users.is_my_friend(user.id, user_param.id))
		return c.json({ message: 'No user matches' }, 401);
	await Friendly_Users.delete_friend(user.id, user_param.id);
	return c.json({ message: 'User friend list updated, user successfully deleted' }, 200);
});

app.notFound((c: Context) => {
	return c.json({ message: 'Route not Found' }, 404);
});

export default app;
