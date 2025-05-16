import { Hono, type Context } from 'hono';
import { upgradeWebSocket } from 'hono/deno';
import { check_cookies } from '../utils/jwt.ts';
import { Notif } from '../db_objects/notif.ts';
import { WSContext } from 'hono/ws';
import { User } from '../db_objects/user.ts';

const app = new Hono();
interface ExtendedWebSocket extends WSContext<WebSocket> {
	user: User;
}

const connectedUsers = new Map<number, WSContext<WebSocket>>();

app.get(
	'/ws',
	upgradeWebSocket((c) => {
		return check_cookies(c, '/notifs').then((ret_check) => ({
			onOpen: (_event, ws) => {
				const { user } = ret_check;
				if (user == null) {
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
					(ws as ExtendedWebSocket).user = user;

					connectedUsers.set(user.id, ws);

					user.online = true;
					user.connected_at = BigInt(Date.now());
					user.save().then(async () => {
						const notifs = await Notif.get_all_by_user_id(user.id);
						const notifs_serialize = notifs.map((notif: Notif) => {
							return notif.serialize();
						});
						ws.send(
							JSON.stringify({
								type: 'init',
								notifs: notifs_serialize,
							})
						);
					});
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
				let user = (ws as ExtendedWebSocket).user;
				if (user == null) {
					ws.close();
					return;
				}
				user = await User.get_by_id(user.id);
				if (user == null) {
					ws.send(
						JSON.stringify({
							type: 'error',
							message: 'User not found',
						})
					);
					ws.close();
					return;
				}		
				setTimeout(async () => {
					if (!connectedUsers.has(user.id)) {
						user.connected_at = BigInt(Date.now());
						user.online = false;
						await user.save();
					}
				}, 6000);
				connectedUsers.delete(user.id);
			},
		}));
	})
);

export async function post_notif(
	user_id: number,
	content: string,
	redirect: string,
	type: string = 'new'
) {
	if (type == 'new') {
		const notif = new Notif(content, user_id, redirect);
		await notif.create();
	}

	const ws = connectedUsers.get(user_id);
	if (ws) {
		ws.send(
			JSON.stringify({
				type,
				notif: notif.serialize(),
			})
		);
	}
}

app.notFound((c: Context) => {
	return c.json({ message: 'Route not Found' }, 404);
});

export default app;