import { Hono, type Context } from 'hono';
import { check_cookies } from '../utils/jwt.ts';
import { User } from '../db_objects/user.ts';
import { Date_Users } from '../db_objects/date_users.ts';
import { post_notif } from './notif.ts';

const app = new Hono();

app.post('/set', async (c: Context) => {
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);

	const body = await c.req.json();
	const { other_user_id, description, time } = body;
	if (!other_user_id || !description || !time)
		return c.json({ message: 'Missing parameters' }, 400);
	if (time <= Date.now())
		return c.json(
			{
				message:
					'Date must be in the future unless you are a time traveller !',
			},
			400
		);
	try {
		await User.get_by_id(Number(other_user_id));
	} catch (_e) {
		return c.json({ message: 'User not found !' }, 404);
	}
	const Dates = (await Date_Users.get_user_dates(user.id)).filter(
		(date) => date.accepted == true || date.user_id == user.id
	);
	if (
		Dates.some(
			(date) =>
				BigInt(date.date) - BigInt(1800000) <= BigInt(time) &&
				BigInt(date.date) + BigInt(1800000) >= BigInt(time)
		)
	)
		return c.json(
			{ message: 'You already have a date at this time !' },
			400
		);
	const date = new Date_Users(user.id, other_user_id, description, time);
	await date.create();
	await post_notif(
		other_user_id,
		user.username + ' wants to meet you !',
		'/user'
	);
	return c.json({
		message: 'Date successfully created',
		date: await date.serialize(),
	});
});

app.all('/set', (c: Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405);
});

app.post('/accept', async (c: Context) => {
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);

	const body = await c.req.json();
	const { date_id, accept } = body;
	if (!date_id || accept == undefined)
		return c.json({ message: 'Missing parameters' }, 400);
	let date: Date_Users;
	try {
		date = await Date_Users.get_by_id(Number(date_id));
	} catch (_e) {
		return c.json({ message: 'Date not found !' }, 404);
	}
	if (user.id != date.user_id && user.id != date.user_to_meet_id)
		return c.json(
			{ message: 'You are not allowed to accept this date !' },
			401
		);

	if (date.user_to_meet_id != user.id) {
		return c.json({ message: `You can't accept your own date !` }, 401);
	}

	if (accept == true) {
		console.log('accepting date');
		date.accepted = true;
		await date.save();
		let notif_mess = user.username + ' accepted your date !';
		await post_notif(date.user_id, notif_mess, '/user');
		return c.json({ message: 'Date succesfully accepted' }, 200);
	} else {
		await date.delete();
		const notif_mess = user.username + ' refused your date !';
		await post_notif(date.user_id, notif_mess, '/user');
		return c.json({ message: 'Date succesfully refused' }, 200);
	}
});

app.all('/accept', (c: Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405);
});

app.get('/all', async (c: Context) => {
	const ret_check = await check_cookies(c);
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !' }, 404);
	const { message, user } = ret_check;
	if (message != undefined || user == null)
		return c.json({ message: message }, 401);

	const dates = await Date_Users.get_user_dates(user.id);
	const dates_serialized = await Promise.all(
		dates.map(async (date) => {
			if (date.date < BigInt(Date.now())) {
				await date.delete();
				return null;
			}
			return await date.serialize();
		})
	);
	return c.json({ message: 'Found dates', dates: dates_serialized });
});

app.all('/all', (c: Context) => {
	return c.json({ message: 'Method Not Allowed' }, 405);
});

app.notFound((c: Context) => {
	return c.json({ message: 'Route not Found' }, 404);
});

export default app;
