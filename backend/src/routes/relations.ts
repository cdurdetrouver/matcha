import { Hono, type Context } from 'hono';
import { check_cookies } from "../utils/jwt.ts";
import { Relations_Users } from "../db_objects/relations_users.ts";
import { User } from "../db_objects/user.ts";
import { post_notif } from "./notif.ts";
import { Chat } from "../db_objects/chats.ts";
import { Chats_Users } from "../db_objects/chats_users.ts";

const app = new Hono();

//check si need to serialize relatiions
app.get('/all', async (c: Context) => {
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);

	const relations = await Relations_Users.get_relations(user.id);
	return c.json({ message: 'Found all relations', relations: relations }, 200);
});

app.all('/all', (c: Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405);
});

app.post('/create', async (c: Context) => {
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);

	let { target_id, relation } = await c.req.json();
	let target_user;
	try {
		target_id = Number(target_id);
		target_user = await User.get_by_id(target_id);
	}
	catch (_e) {
		return c.json({ message: 'Target user does not exist' }, 400);
	}
	relation = Number(relation);
	if (relation < 0 || relation > 2)
		return c.json({ message: 'Relation range is invalid' }, 400);
	if (await Relations_Users.is_related(user.id, target_id))
		return c.json({ message: 'Relation already exists' }, 400);
	await Relations_Users.add_relation(user.id, target_id, relation);
	let notif_mess = user.username + relation ? ' liked you' : ' loved you';
	let notif_redirect = '/user/' + user.id;
	if (await Relations_Users.is_related(target_id, user.id)) {
		notif_mess = target_user.username + relation ? ' liked you too' : ' loved you too' + ' start chat now';
		const chat = new Chat(name);
		await chat.create();
		Chats_Users.add_user_chat(user.id, chat.id);
		Chats_Users.add_user_chat(target_id, chat.id);
		notif_redirect = '/chat/' + chat.id;
		await post_notif(user.id, notif_mess, notif_redirect);
		notif_mess = user.username + relation ? ' liked you back' : ' loved you back' + ' start chat now';
	}
	else
		await Relations_Users.add_relation(target_id, user.id, relation);
	await post_notif(target_id, notif_mess, notif_redirect);
	return c.json({ message: 'Relation created' }, 200);

});

app.notFound((c: Context) => {
	return c.json({ message: 'Route not Found' }, 404);
});

export default app;