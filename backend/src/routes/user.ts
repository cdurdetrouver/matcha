import { Hono } from 'hono'
import bcrypt from "bcrypt";
import { user_match, user_check } from '../utils/user.ts';
import { user } from '../types/user.ts';
import { getCookie, setCookie, deleteCookie} from 'hono/cookie';
import { get_access_token, get_refresh_token, verify_token, get_date_token, check_cookies } from '../utils/jwt.ts';
import { db_print_table, db_post_obj, db_get_number_obj, db_get_obj_custom, db_get_user, db_get_user_custom, db_delete_obj, db_put_obj } from '../utils/db_actions.ts';

const app = new Hono()

app.get('/refresh_token/:id', async (c) => {
	const id = await c.req.param('id');
	const refresh_token = await getCookie(c).refresh_token;
	
	if (!refresh_token)
		return c.json({ message: "No refresh token."}, 401);
	const ret_user = (await db_get_obj_custom("user", "id", id))['rows'];


	if (ret_user == -1 || ret_user.length == 0)
			return c.json({ message: 'User not found!'}, 404);
	let user_get = new user(null, null, null, null, null, ret_user[0]);
	if (refresh_token != user_get.token)
		return c.json({ message: "Bad refresh token."}, 401);
	const current_date = new Date();
	if (current_date >= Date.parse(user.is_valid_token))
		return c.json({ message: "Refresh token expired."}, 401);
	const acces_token = await get_access_token(user);

	c.res.headers.append('Set-Cookie', `acces_token=${acces_token}; HttpOnly; Secure; Path=/`);
	return c.json({ message: 'User logged in!'}, 200);
});

app.post('/login', async (c) => {
	const { email, password } = await c.req.json();

	if ( !email || !password)
		return c.json({ message: 'Body not format correctly !'}, 400);
	const { user_found, user } = await user_match(email, password);

	if (user_found == 0) {
		const acces_token = await get_access_token(user);
		const refresh_token = await get_refresh_token(user);
		user.refresh_token = refresh_token;
		user.is_valid_token = await get_date_token();

		const ret_user = await db_post_obj("user", user, 4);

		if (ret_user == -1)
			return c.json({ message: 'User update failed!'}, 500);

		c.res.headers.append('Set-Cookie', `acces_token=${acces_token}; HttpOnly; Secure; Path=/`);
		c.res.headers.append('Set-Cookie', `refresh_token=${refresh_token}; HttpOnly; Secure; Path=/`);
		return c.json({ message: 'User logged in!'}, 200);
	}
	else if (user_found == 1)
		return c.json({ message: "Email or password is incorrect"}, 401);
	return c.json({ message: 'User not found!'}, 404);
});

app.post('/register', async (c) => {
	const { username, email, password } = await c.req.json();

	if (!username || !email || !password)
		return c.json({ message: 'Body not format correctly !'}, 400);
	const saltRounds = 12;
	const [ ret_check, mess, ret_code ] = await user_check(username, email, password);

	if (!ret_check)
		return c.json({ message: mess}, ret_code);

	const hash = bcrypt.hashSync(password, saltRounds);
	const acces_token = await get_access_token(user);
	const refresh_token = await get_refresh_token(user);
	let user_test = new user(username, hash, email, refresh_token, await get_date_token());
	const ret_user = await db_post_obj("user", user_test, 3);

	if (ret_user == -1)
		return c.json({ message: 'User creation failed!'}, 500);


	c.res.headers.append('Set-Cookie', `acces_token=${acces_token}; HttpOnly; Secure; Path=/`);
	c.res.headers.append('Set-Cookie', `refresh_token=${refresh_token}; HttpOnly; Secure; Path=/`);
	return c.json({ message: 'User created!'}, 200);
});

app.put('/:id', async (c) => {
	const body = await c.req.json();
	const id = await c.req.param('id');
	const user_info = await db_get_user(id);

	if (user_info == -1)
		return c.json({ message: 'User not found!'}, 404);

	let user_test = new user(body.username, body.password, body.email);	
	const ret_user = db_put_obj("user", id, user_test);
	if (ret_user == -1)
		return c.json({ message: 'User update failed!'}, 500);
	return c.json({ message: 'User updated!'}, 200);
});

app.get('/:id', async (c) => {
	const cookies = await check_cookies(c);
	if (cookies != 1)
			return c.json({message: cookies}, 401);
	const id = await c.req.param('id');
	let user_info = await db_get_user(id);

	if (user_info == -1)
		return c.json({ message: 'User not found!'}, 404);
	user_info = user_info.serialize();
	return c.json({message: "user found", user: user_info}, 200);
});

app.delete('/:id', async (c) => {
	const id = await c.req.param('id');
	let user_info = await db_get_user(id);

	if (user_info == -1)
		return c.json({ message: 'User not found!'}, 404);
	user_info = await db_delete_obj("user", id, client);
	if (user_info == -1)
		return c.json({ message: 'User deletion failed!'}, 500);
	return c.json({ message: 'User Deleted'}, 200);
});

export default app