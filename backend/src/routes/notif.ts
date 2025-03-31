import { Hono, type Context } from 'hono';
import { upgradeWebSocket } from 'hono/deno';
import { check_cookies } from '../utils/jwt.ts';
import { Notif } from '../db_objects/notif.ts';
import { WSContext } from 'hono/ws';

const app = new Hono();
const connectedUsers = new Map<number, WSContext<WebSocket>>();

app.get(
	'/ws',
	upgradeWebSocket(async (c) => {
		const ret_check = await check_cookies(c);

		return {
			onOpen: async (_event, ws) => {
				if (ret_check.user == null) {
					ws.send(
						JSON.stringify({
							type: 'error',
							message: 'Unauthorized',
						})
					);
					ws.close();
					return;
				}
				try {
					const { user } = ret_check;
					ws.user = user;

					connectedUsers.set(user.id, ws);

					user.online = true;
					await user.save();
					const notifs = await Notif.get_all_by_user_id(user.id);
					const notifs_serialize = notifs.map((notif: Notif) => {
						notif.serialize();
					});
					ws.send(JSON.stringify({ notifs: notifs_serialize }));
					post_notif(user.id, 'test', 'test');
				} catch (e) {
					console.error(e);
					ws.send(
						JSON.stringify({
							type: 'error',
							message: 'Error while fetching notifications',
						})
					);
					ws.close();
					return;
				}
			},
			onMessage: async (event, ws) => {
				const data = JSON.parse(String(event.data));
				if (data.type === 'delete') {
					await Notif.delete(data.id);
					ws.send(
						JSON.stringify({
							type: 'delete',
							id: data.id,
						})
					);
				}
			},
			onClose: async (_event, ws) => {
				const user = ws.user;
				if (user) {
					user.online = false;
					await user.save();

					connectedUsers.delete(user.id);
				}
			},
		};
	})
);

export async function post_notif(
	user_id: number,
	content: string,
	redirect: string
) {
	const notif = new Notif(content, user_id, redirect);
	await notif.create();

	const ws = connectedUsers.get(user_id);
	if (ws) {
		ws.send(
			JSON.stringify({
				type: 'new',
				notif: notif.serialize(),
			})
		);
	}
}

app.notFound((c: Context) => {
	return c.json({ message: 'Route not Found' }, 404);
});

export default app;
