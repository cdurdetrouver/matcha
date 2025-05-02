import { Hono, type Context } from 'hono';
import { check_cookies } from "../utils/jwt.ts";
import { User } from "../db_objects/user.ts";
import { Seen_Users } from "../db_objects/seen_users.ts";
import { report_user, Reasonlist } from "../utils/report.ts";
const app = new Hono();

app.post('/user', async (c: Context) => {
	const body = await c.req.json();
	const { target_id, reason } = body;
	const ret_check = await check_cookies(c);

	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 400);
	const { message, ret_val, user } = ret_check;
	if (user == null || message != undefined)
		return c.json({ message: message }, ret_val);

	if (target_id == undefined || reason == undefined)
		return c.json({ message: 'Missing parameters' }, 400);
	if (Reasonlist.includes(reason) == false)
		return c.json({ message: 'Invalid reason' }, 400);
	if (user.id == target_id)
		return c.json({ message: 'You cannot report yourself' }, 400);
	let target_user: User;
	try {
		target_user = await User.get_by_id(target_id);
	} catch (_e) {
			return c.json({ message: 'User not found' }, 404);
	}
	const time_ms = await Seen_Users.is_user_seen_by(user.id, target_id);
	if (time_ms == undefined || time_ms < 15000)
		return c.json({ message: 'User reported' }, 200);
	await report_user(user, target_user, reason);
	return c.json({ message: 'User reported' }, 200);
});

app.all('/user', (c: Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405);
});

app.notFound((c: Context) => {
	return c.json({ message: 'Route not Found' }, 404);
});

export default app;