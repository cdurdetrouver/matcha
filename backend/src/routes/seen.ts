import { Hono, type Context } from 'hono';
import { upgradeWebSocket } from 'hono/deno';
import { check_cookies } from '../utils/jwt.ts';
import { WSContext } from 'hono/ws';
import { User } from '../db_objects/user.ts';
import { Seen_Users } from '../db_objects/seen_users.ts';

const app = new Hono();
interface ExtendedWebSocket extends WSContext<WebSocket> {
	user: User;
	target_user: User;
	startTime: number;
}

app.get(
	'/ws',
	upgradeWebSocket((c) => {
		return check_cookies(c).then((ret_check) => ({
			onOpen: async (_event, ws) => {
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

					const targetUserId = Number(c.req.query('target_user_id'));
					if (!targetUserId || isNaN(targetUserId)) {
						ws.send(
							JSON.stringify({
								type: 'error',
								message: 'Invalid target user ID',
							})
						);
						ws.close();
						return;
					}

					const target_user = await User.get_by_id(targetUserId);
					(ws as ExtendedWebSocket).target_user = target_user;

					(ws as ExtendedWebSocket).startTime = Date.now();
				} catch (e) {
					console.error(e);
					ws.send(
						JSON.stringify({
							type: 'error',
							message: 'Error while initializing WebSocket',
						})
					);
					ws.close();
					return;
				}
			},
			onClose: async (_event, ws) => {
				const extendedWs = ws as ExtendedWebSocket;
				const user = extendedWs.user;
				const target_user = extendedWs.target_user;

				if (!user || !target_user) {
					ws.close();
					return;
				}

				const elapsedTime = Date.now() - extendedWs.startTime;

				try {
					await Seen_Users.see_user(
						user.id,
						target_user.id,
						elapsedTime
					);
				} catch (e) {
					console.error('Error updating seen_users:', e);
				}
			},
		}));
	})
);

app.notFound((c: Context) => {
	return c.json({ message: 'Route not Found' }, 404);
});

export default app;
