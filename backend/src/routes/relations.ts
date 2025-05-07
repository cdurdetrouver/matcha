import { Hono, type Context } from 'hono';
import { check_cookies } from '../utils/jwt.ts';
import { Relations_Users } from '../db_objects/relations_users.ts';
import { post_notif } from './notif.ts';
import { Chat } from '../db_objects/chats.ts';
import { Chats_Users } from '../db_objects/chats_users.ts';
import { Seen_Users } from '../db_objects/seen_users.ts';

const app = new Hono();

app.get('/all', async (c: Context) => {
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);

	const relations = await Relations_Users.get_relations(user.id);
	if (relations.length === 0)
		return c.json({ message: 'No relations found' }, 404);
	const relations_serialized = await Promise.all(
		relations.map(async (relation) => {
			return await relation.serialize();
		})
	);
	return c.json(
		{ message: 'Found all relations', relations: relations_serialized },
		200
	);
});

app.all('/all', (c: Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405);
});

app.get('/:id', async (c: Context) => {
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);

	const id = Number(c.req.param('id'));
	if (id == undefined) return c.json({ message: 'ID is required' }, 400);
	if (id === user.id)
		return c.json({ message: 'You cannot relate to yourself' }, 400);
	try {
		await user.get_by_id(id);
		const rel = await Relations_Users.get_relation(id, user.id);
		return c.json({ relation: await rel?.serialize() }, 200);
	} catch (_e) {
		if (_e instanceof Error && _e.message === 'User not found')
			return c.json({ message: 'User does not exist' }, 400);
		return c.json({ message: 'Relation does not exist' }, 400);
	}
});

app.all('/:id', (c: Context) => {
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
		target_user = await user.get_by_id(target_id);
	} catch (_e) {
		return c.json({ message: 'Target user does not exist' }, 400);
	}
	if (target_user.id === user.id)
		return c.json({ message: 'You cannot relate to yourself' }, 400);
	relation = Number(relation);
	if (relation !== 0 && relation !== 2)
		return c.json({ message: 'Relation range is invalid' }, 400);
	if (target_user.wanted !== 1 && target_user.wanted !== relation)
		return c.json(
			{
				message: 'Target user is not looking for this kind of relation',
			},
			400
		);
	if ((await Relations_Users.is_related(user.id, target_id)) != -1)
		return c.json({ message: 'Relation already exists' }, 400);
	if (relation === 0 && (target_user.wanted > 1 || user.wanted > 1))
		return c.json(
			{
				message:
					'You cannot send friend request when one of the user only search love',
			},
			400
		);
	if (relation === 2 && target_user.wanted < 1 && user.wanted < 1)
		return c.json(
			{
				message:
					'You cannot send love request when one of the user only search for friend',
			},
			400
		);
	const time_to_match = await Seen_Users.is_user_seen_by(
		target_user.id,
		user.id
	);
	await Relations_Users.add_relation(
		user.id,
		target_id,
		relation,
		time_to_match
	);
	let notif_mess =
		user.username + (relation === 2 ? ' loved you' : ' liked you');
	let notif_redirect = '/user/' + user.id;
	if (await Relations_Users.is_related(target_id, user.id) == relation) {
		notif_mess =
			target_user.username +
			(relation === 2 ? ' loved you too' : ' liked you too') +
			' start chat now';
		const chatName = `${user.username}-${target_user.username}`;
		const chat = new Chat(chatName);
		await chat.create();
		Chats_Users.add_user_chat(user.id, chat.id);
		Chats_Users.add_user_chat(target_id, chat.id);
		notif_redirect = '/chat/' + chat.id;
		await post_notif(user.id, notif_mess, notif_redirect);
		notif_mess =
			user.username +
			(relation === 2 ? ' loved you back' : ' liked you back') +
			' start chat now';
	}
	await post_notif(target_id, notif_mess, notif_redirect);
	return c.json({ message: 'Relation created' }, 200);
});

app.all('/create', (c: Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405);
});

app.delete('/delete', async (c: Context) => {
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);

	let { target_id } = await c.req.json();
	target_id = Number(target_id);
	if (target_id == undefined)
		return c.json({ message: 'ID is required' }, 400);
	if (target_id === user.id)
		return c.json({ message: 'You cannot relate to yourself' }, 400);
	try {
		await Relations_Users.delete_relation(user.id, target_id);
		const chats = await Chats_Users.get_chats_by_2_user(user.id, target_id);
		await Promise.all(
			chats.map(async (chat_id) => {
				await Chats_Users.delete_user_chat(user.id, chat_id);
			})
		);
	} catch (_e) {
		return c.json({ message: 'Relation does not exist' }, 400);
	}
	return c.json({ message: 'Relation deleted' }, 200);
});

app.all('/delete', (c: Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405);
});

app.get('/is_related_to_me/:id', async (c: Context) => {
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);
	const id = Number(c.req.param('id'));
	if (isNaN(id)) return c.json({ message: 'ID is required' }, 400);
	if (id === user.id)
		return c.json({ message: 'You cannot relate to yourself' }, 400);
	try {
		const target_user = await user.get_by_id(id);
		const rel = await Relations_Users.get_relation(user.id, id);
		return c.json({ message: ('User is related to '
			+ target_user.username), relation: await rel?.serialize() }, 200);
	} catch (e) {
		if (e instanceof Error && e.message === 'User not found')
			return c.json({ message: 'User does not exist' }, 400);
		return c.json({ message: 'Relation does not exist' }, 400);
	}
});

app.all('/is_related_to_me/:id', (c: Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405);
});

app.notFound((c: Context) => {
	return c.json({ message: 'Route not Found' }, 404);
});

export default app;
