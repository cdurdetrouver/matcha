import { Hono, type Context } from 'hono';
import {
	hashSync,
	genSaltSync,
	compare,
} from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';
import {
	user_match,
	user_check,
	check_username,
	check_email,
	check_password,
} from '../utils/user.ts';
import { getCookie, deleteCookie } from 'hono/cookie';
import {
	get_access_token,
	get_refresh_token,
	verify_token,
	check_cookies,
	get_reset_token,
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
import {
	sendVerificationEmail,
	sendChangePasswordEmail,
} from '../utils/send_mail.ts';
import { get_userIntra_by_code } from '../utils/intra42.ts';
import { get_userGoogle_by_code } from '../utils/googleauth.ts';
import { Tags_Users } from '../db_objects/tags_users.ts';
import { Tag } from '../db_objects/tags.ts';

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
	const { old_password, password } = await c.req.json();
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);
	if (user.auth_provider != 'email')
		return c.json({ message: 'User not registered with email !' }, 401);
	const is_valid_pass = await compare(old_password, user.password);
	if (!is_valid_pass) return c.json({ message: 'Wrong password' }, 401);
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
		if (ret_user.auth_provider != 'email')
			return c.json({ message: 'User not registered with email !' }, 401);
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
	const ret_check = await check_cookies(c, '/full_register');
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);
	if (user.complete_profile) {
		return c.json({ message: 'User already fully registered !' }, 401);
	}
	if ((await Image.get_post_by_user(user.id)).length < 1)
		return c.json({ message: 'User needs at least one post' }, 400);
	const { wanted, interests, description, location, birthdate, mbti } = body;
	if (wanted == undefined || interests == undefined)
		return c.json({ message: 'Body not correctly formatted.' }, 422);
	if (wanted >= 1) {
		const { gender, sexual_preferences } = body;
		user.gender = gender;
		user.sexual_preferences = sexual_preferences;
	}
	user.mbti = mbti;
	user.birthdate = birthdate;
	user.wanted = wanted;
	user.description = description;
	user.lat = Number(location[0]);
	user.long = Number(location[1]);
	if ((await Image.get_post_by_user(user.id)).length < 1)
		return c.json({ message: 'User need at least 1 post' }, 400);
	for (const tag of interests) {
		if (!(await Tag.tag_exists(tag)))
			return c.json({ message: 'Tag does not exist' }, 400);
		if (await Tags_Users.had_tag(user.id, tag))
			return c.json({ message: 'User already has this tag' }, 400);
	}
	if (interests.length > 0) await Tags_Users.add_tags(user.id, interests);
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
	const name = 'avatar_' + randomNumber + '_default';
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

app.post('/login/google', async (c: Context) => {
	const { code } = await c.req.json();
	if (!code) return c.json({ message: 'Body not format correctly !' }, 400);
	try {
		const user = await get_userGoogle_by_code(code);
		const access_token = await get_access_token(user);
		const refresh_token = await get_refresh_token(user);
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
			{ message: 'User logged in!', user: await user.serialize_me() },
			200
		);
	} catch (error) {
		if (error instanceof Error)
			return c.json({ message: error.message }, 401);
		return c.json({ message: 'User not found !' }, 404);
	}
});

app.all('/login/google', (c: Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405);
});

app.post('/login/intra', async (c: Context) => {
	const { code } = await c.req.json();
	if (!code) return c.json({ message: 'Body not format correctly !' }, 400);
	try {
		const user = await get_userIntra_by_code(code);
		const access_token = await get_access_token(user);
		const refresh_token = await get_refresh_token(user);
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
			{ message: 'User logged in!', user: await user.serialize_me() },
			200
		);
	} catch (error) {
		if (error instanceof Error)
			return c.json({ message: error.message }, 401);
		return c.json({ message: 'User not found !' }, 404);
	}
});

app.all('/login/intra', (c: Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405);
});

app.post('/verif', async (c: Context) => {
	const { token, userid } = await c.req.json();
	let ret_token:
		| {
				expiration: number;
				token: string;
		  }
		| undefined = undefined;	
	try {
		ret_token = await Email_Verif.get_by_user_id(userid);
		if (ret_token == undefined) throw new Error('Token not found !');
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
		if (error instanceof Error)
			return c.json({ message: error.message }, 422);
		else return c.json({ message: 'You need to register first !' }, 422);
	}
});

app.all('/verif', (c: Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405);
});

app.put('/edit', async (c: Context) => {
	const { username, email, description, latitude, longitude, wanted,
		insta_link, twitter_link, intra_link } =
		await c.req.json();

	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);
	if (!user.complete_profile)
		return c.json({ message: 'User not fully registered !' }, 401);
	if (!user.email_verif)
		return c.json({ message: 'User not verified !' }, 401);

	if (username != undefined) {
		const [is_valid_username, err_username] = await check_username(
			username
		);
		if (!is_valid_username) return c.json({ message: err_username }, 401);
		user.username = username;
	}
	if (email != undefined) {
		if (user.auth_provider != 'email')
			return c.json({ message: 'User not registered with email !' }, 401);
		const [is_valid_email, err_email] = await check_email(email);
		if (!is_valid_email) return c.json({ message: err_email }, 401);
		user.email = email;
	}
	if (description != undefined) {
		if (description.length > 280)
			return c.json({ message: 'Description too long' }, 401);
		user.description = description;
	}
	if (latitude != undefined && longitude != undefined) {
		user.lat = latitude;
		user.long = longitude;
	}
	if (wanted != undefined) {
		user.wanted = wanted;
	}
	if (insta_link != undefined)
		user.insta_link = insta_link;
	if (twitter_link != undefined)
		user.x_link = twitter_link;
	if (intra_link != undefined)
		user.intra_link = intra_link;
	try {
		await user.save();
		const serialized_user = await user.serialize_me();
		return c.json(
			{ message: 'User updated !', user: serialized_user },
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
		if (!image.filename.endsWith('_default'))
			await delete_file(image.filename);
		await Image.delete_by_id(image.id);
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
	const ret_check = await check_cookies(c, '/image');
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
	const ret_check = await check_cookies(c, '/me');
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

app.post('/coordinates', async (c: Context) => {
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 400);
	const { message, ret_val, user } = ret_check;
	if (user == null || message != undefined)
		return c.json({ message: message }, ret_val);
	const { lat, long, radius } = await c.req.json();
	if (lat == undefined || long == undefined || radius == undefined)
		return c.json({ message: 'Body not formatted correctly' }, 422);
	const users = await user.get_all_by_loc(radius, long, lat);
	if (users == undefined) return c.json({ message: 'No users found' }, 404);
	const users_serialized = await Promise.all(
		users.map(async (user: User) => await user.serialize())
	);
	return c.json({ message: 'Users found !', users: users_serialized }, 200);
});

app.all('/coordinates', (c: Context) => {
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
	if (user.id == id) return c.json({ message: 'Not authorized' }, 401);

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

app.post('/reset_password', async (c: Context) => {
	const { email } = await c.req.json();
	try {
		const user = await User.get_by_field('email', email);
		if (user[0].auth_provider != 'email')
			return c.json({ message: 'User not registered with email !' }, 401);
		const token = await get_reset_token(user[0]);
		const url = `${FRONTEND_URL}/reset_pass?token=${token}`;
		await sendChangePasswordEmail(user[0].email, url);
		return c.json(
			{ message: 'Reset password email sent !', token: token },
			200
		);
	} catch (error) {
		if (error instanceof Error) return c.json({ message: error }, 422);
		else return c.json({ message: 'You need to register first !' }, 422);
	}
});

app.all('/reset_password', (c: Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405);
});

app.post('/update_pass', async (c: Context) => {
	const { token, new_password } = await c.req.json();
	try {
		if (!token || !new_password)
			return c.json({ message: 'Body not format correctly !' }, 400);
		const ret_check = await verify_token(token);
		if (ret_check == null)
			return c.json({ message: 'Server cannot perform checks !' }, 404);
		const { message, id_ret, token_type } = ret_check;
		if (message) return c.json({ message: message }, 401);
		if (token_type != 'reset')
			return c.json({ message: 'Wrong token' }, 401);
		const user = await User.get_by_id(Number(id_ret));
		if (user == undefined)
			return c.json({ message: 'User not found' }, 404);
		const [valid, ret_message] = check_password(
			new_password,
			user.username
		);
		if (!valid) return c.json({ message: ret_message }, 401);
		const saltRounds = genSaltSync(12);
		const hash_pass = hashSync(new_password, saltRounds);
		user.password = hash_pass;
		await user.save();
		return c.json({ message: 'Password successfully changed' }, 200);
	} catch (error) {
		if (error instanceof Error) return c.json({ message: error }, 422);
		else return c.json({ message: 'You need to register first !' }, 422);
	}
});

app.all('/update_pass', (c: Context) => {
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

app.notFound((c: Context) => {
	return c.json({ message: 'Route not Found' }, 404);
});

export default app;
