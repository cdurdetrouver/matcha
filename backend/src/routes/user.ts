import { Hono, type Context } from "npm:hono";
import { hashSync, genSaltSync } from "https://deno.land/x/bcrypt/mod.ts";
import { user_match, user_check } from '../utils/user.ts';
import { user } from '../types/user.ts';
import { getCookie, deleteCookie} from 'hono/cookie';
import { get_access_token, get_refresh_token, verify_token, check_cookies } from '../utils/jwt.ts';
import { db_post_obj, db_get_user, db_get_user_custom, db_delete_obj, db_put_obj } from '../utils/db_actions.ts';

const app = new Hono()

app.delete('/logout', async (c) => {
	deleteCookie(c, `access_token`);
	deleteCookie(c, `refresh_token`);
	return c.json({ message: 'User logged out!'}, 200);
});

app.all('/logout', (c) => {
	return c.json({ message: 'Method Not Allowed' }, 405)
});

app.get('/refresh_token/', async (c: Context) => {
	const refresh_token = await getCookie(c, 'refresh_token');
	
	if (!refresh_token)
		return c.json({ message: "No refresh token provided."}, 401);

	const { message, id_ret, token_type } = await verify_token(refresh_token);
	if (token_type != "refresh")
		return c.json({ message: "Wrong token type provided."}, 401);
	if (message)
		return {cookies: message, ret_val: 401, user: null};
	// const access_token = await get_access_token(ret_user);

	deleteCookie(c, `access_token`);
	c.res.headers.append('Set-Cookie', `access_token=${""}; HttpOnly; Secure; Path=/`);
	return c.json({ message: 'User logged in!'}, 200);
});

app.all('/refresh_token', (c) => {
	return c.json({ message: 'Method Not Allowed' }, 405)
});

app.post('/login', async (c) => {
	const { email, password } = await c.req.json();

	if ( !email || !password )
		return c.json({ message: 'Body not format correctly !'}, 400);
	const { user_found, ret_user } = await user_match(email, password);

	if (user_found == 0 && ret_user != undefined) {
		const access_token = await get_access_token(ret_user);
		const refresh_token = await get_refresh_token(ret_user);

		c.res.headers.append('Set-Cookie', `access_token=${access_token}; HttpOnly; Secure; Path=/`);
		c.res.headers.append('Set-Cookie', `refresh_token=${refresh_token}; HttpOnly; Secure; Path=/`);
		return c.json({ message: 'User logged in!', user:ret_user.serialize()}, 200);
	}
	else if (user_found == 1)
		return c.json({ message: "Email or password is incorrect"}, 401);
	return c.json({ message: 'User not found!'}, 404);
});

app.all('/login', (c) => {
	return c.json({ message: 'Method Not Allowed' }, 405)
});

app.post('/register', async (c) => {
	const { username, email, password } = await c.req.json();

	console.log(username, email, password);
	
	if (!username || !email || !password)
		return c.json({ message: 'Body not format correctly !'}, 400);
	const saltRounds = genSaltSync(12);
	const [ ret_check, mess, ret_code ] = await user_check(username, email, password);
	
	if (!ret_check)
		return c.json({ message: mess}, ret_code);
	
	const hash_pass = await hashSync(password, saltRounds);
	const user_register = new user(username, hash_pass, email, "");
	const ret_user = await db_post_obj("user", user_register, 3);
	if (ret_user == -1)
		return c.json({ message: 'User creation failed!'}, 500);
	const user_get = await db_get_user_custom("email", email);
	if (user_get == -1)
		return c.json({ message: 'User creation failed!'}, 500);
	const access_token = await get_access_token(user_get);
	const refresh_token = await get_refresh_token(user_get);
	
	
	c.res.headers.append('Set-Cookie', `access_token=${access_token}; HttpOnly; Secure; Path=/`);
	c.res.headers.append('Set-Cookie', `refresh_token=${refresh_token}; HttpOnly; Secure; Path=/`);
	return c.json({ message: 'User created!'}, 200);
});

app.all('/register', (c) => {
	return c.json({ message: 'Method Not Allowed' }, 405)
});

app.put('/:id', async (c) => {
	const body = await c.req.json();
	const id = await c.req.param('id');
	const user_info = await db_get_user(id); 
	
	if (user_info == -1)
		return c.json({ message: 'User not found!'}, 404);
	
	const saltRounds = genSaltSync(12);
	const hash_pass = await hashSync(body.password, saltRounds);
	let user_test = new user(body.username, hash_pass, body.email, "");	
	const ret_user = await db_put_obj("user", id, user_test);
	if (ret_user == -1)
		return c.json({ message: 'User updatenew user failed!'}, 500);
	return c.json({ message: 'User updated!'}, 200);
});

app.get('/:id', async (c) => {
	const id = await c.req.param('id');
	let { cookies, ret_val, user_info } = await check_cookies(c, id);
	if (cookies != 1)
		return c.json({message: cookies}, ret_val);
	if (user_info)
		user_info = user_info.serialize();
	return c.json({message: "user found", user: user_info}, 200);
});

app.delete('/:id', async (c) => {
	const id = await c.req.param('id');
	let { cookies, ret_val, user_info } = await check_cookies(c, id);
	if (cookies != 1)
		return c.json({message: cookies}, 401);
	
	user_info = await db_delete_obj("user", id);
	if (user_info == -1)
		return c.json({ message: 'User deletion failed!'}, 500);
	return c.json({ message: 'User Deleted'}, 200);
});

app.all('/:id', (c) => {
	return c.json({ message: 'Method Not Allowed' }, 405)
});

app.notFound((c) => {
	return c.json({ message: 'Route not Found' }, 404)
});


export default app