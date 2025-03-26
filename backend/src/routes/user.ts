import { Hono, type Context } from "hono";
import { hashSync, genSaltSync } from "https://deno.land/x/bcrypt/mod.ts";
import { user_match, user_check } from '../utils/user.ts';
import { User } from '../types/user.ts';
import { getCookie, deleteCookie} from 'hono/cookie';
import { get_access_token, get_refresh_token, verify_token, check_cookies } from '../utils/jwt.ts';
import { db_post_obj, db_delete_obj, db_put_obj } from '../utils/db_actions.ts';
import { db_get_user, db_get_user_custom } from '../utils/db_user.ts';


const app = new Hono()

//get all  chat

app.delete('/logout', (c:Context) => {
	deleteCookie(c, `access_token`);
	deleteCookie(c, `refresh_token`);
	return c.json({ message: 'User logged out!'}, 200);
});

app.all('/logout', (c:Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405)
});

app.get('/refresh_token/', async (c: Context) => {
	const refresh_token = getCookie(c, 'refresh_token');
	
	if (!refresh_token)
		return c.json({ message: "No refresh token provided."}, 401);

	const tokenResult = await verify_token(refresh_token);
		if (!tokenResult )
			return c.json({message: "Acces token provided not valid"}, 401);
	const {message, id_ret, token_type} = tokenResult;
	if (token_type != "refresh" || id_ret == undefined)
		return c.json({ message: "Wrong token type provided."}, 401);
	if (message)
		return c.json({message: message}, 401);
	const user_info = await db_get_user(id_ret);
	if (user_info == null)
		return c.json({ message: "User not found !"}, 404);
	 const access_token = await get_access_token(user_info);

	deleteCookie(c, `access_token`);
	c.res.headers.append('Set-Cookie', `access_token=${access_token}; HttpOnly; Secure; Path=/`);
	return c.json({ message: 'User logged in!'}, 200);
});

app.all('/refresh_token', (c:Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405)
});

app.post('/login', async (c:Context) => {
	const { email, password } = await c.req.json();

	if ( !email || !password )
		return c.json({ message: 'Body not format correctly !'}, 400);
	const ret_match = await user_match(email, password);
	if (!ret_match)
		return c.json({ message: 'User not found!'}, 404);
	const [ user_found, ret_user ] = ret_match;

	if (user_found == true && ret_user != undefined) {
		const access_token = await get_access_token(ret_user);
		const refresh_token = await get_refresh_token(ret_user);

		deleteCookie(c, `access_token`);
		deleteCookie(c, `refresh_token`);
		c.res.headers.append('Set-Cookie', `access_token=${access_token}; HttpOnly; Secure; Path=/`);
		c.res.headers.append('Set-Cookie', `refresh_token=${refresh_token}; HttpOnly; Secure; Path=/`);
		return c.json({ message: 'User logged in!', user:ret_user.serialize()}, 200);
	}
	else if (user_found == false)
		return c.json({ message: "Email or password is incorrect"}, 401);
	return c.json({ message: 'User not found!'}, 404);
});

app.all('/login', (c:Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405)
});

app.post('/register', async (c:Context) => {
	const { username, email, password } = await c.req.json();
	
	if (!username || !email || !password)
		return c.json({ message: 'Body not format correctly !'}, 400);
	const saltRounds = genSaltSync(12);
	const {error, err_password, err_username, err_email } = await user_check(username, email, password);
	
	if (error)
		return c.json({ err_password, err_username, err_email}, 401);
	
	const hash_pass = hashSync(password, saltRounds);
	const user_register = new User(username, hash_pass, email);
	const ret_user = await db_post_obj("user", user_register);
	if (ret_user == false)
		return c.json({ message: 'User creation failed!'}, 500);
	const user_get = await db_get_user_custom("email", email);
	if (user_get == null)
		return c.json({ message: 'User creation failed!'}, 500);
	const access_token = await get_access_token(user_get);
	const refresh_token = await get_refresh_token(user_get);
	
	deleteCookie(c, `access_token`);
	deleteCookie(c, `refresh_token`);
	c.res.headers.append('Set-Cookie', `access_token=${access_token}; HttpOnly; Secure; Path=/`);
	c.res.headers.append('Set-Cookie', `refresh_token=${refresh_token}; HttpOnly; Secure; Path=/`);
	return c.json({ message: 'User created!', user : user_get.serialize()}, 200);
});

app.all('/register', (c:Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405)
});

app.put('/:id', async (c:Context) => {
	const body = await c.req.json();
	const id = Number(c.req.param('id'));
	const ret_check = await check_cookies(c, id);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !'}, 400);
	const { cookies, ret_val, user } = ret_check;
	if ( user == null )
		return c.json({message: cookies}, ret_val);

	const saltRounds = genSaltSync(12);
	const hash_pass = hashSync(body.password, saltRounds);
	user.email, user.password, user.email = hash_pass, body.email;
	const ret_user = await db_put_obj("user", id, user);
	if (ret_user == false)
		return c.json({ message: 'User update user failed!'}, 500);
	return c.json({ message: 'User updated!'}, 200);
});

app.get('/:id', async (c:Context) => {
	const id = Number(c.req.param('id'));
	const ret_check = await check_cookies(c, id, true);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !'}, 400);
	const { cookies, ret_val, user } = ret_check;
	if ( user == null )
		return c.json({message: cookies}, ret_val);
	const user_info = user.serialize();
	return c.json({message: "user found", user: user_info}, 200);
});

app.delete('/:id', async (c:Context) => {
	const id = Number(c.req.param('id'));
	const ret_check = await check_cookies(c, id);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !'}, 404);
	const { cookies } = ret_check;
	if (cookies != true)
		return c.json({message: cookies}, 401);

	const user_info = await db_delete_obj("user", id);
	if (user_info == false)
		return c.json({ message: 'User deletion failed!'}, 500);
	return c.json({ message: 'User Deleted'}, 200);
});

app.all('/:id', (c:Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405)
});

app.notFound((c:Context) => {
	return c.json({ message: 'Route not Found' }, 404)
});


export default app