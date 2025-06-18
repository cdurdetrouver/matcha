import { Hono, type Context } from 'hono';
import { upgradeWebSocket } from 'hono/deno';
import { check_cookies } from '../utils/jwt.ts';
import { Notif } from '../db_objects/notif.ts';
import { NotifType } from '../types/notifs.ts';
import { WSContext } from 'hono/ws';
import { User } from '../db_objects/user.ts';
import { Chats_Users } from "../db_objects/chats_users.ts";

const app = new Hono();
interface ExtendedWebSocket extends WSContext<WebSocket> {
	user: User;
}

const connectedUsers = new Map<number, WSContext<WebSocket>>();

app.get(
	'/ws',
	upgradeWebSocket((c: Context) => {
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
				let send_data;
				let target_id = undefined;
				let type = undefined;
				if (data.target_chat && typeof data.target_chat !== 'number')
					return console.error('Invalid target_chat type:', data.target_chat);
				switch (data.type) {
					case 'delete':
						await Notif.delete(data.id);
						ws.send(
							JSON.stringify({
								type: 'delete',
								id: data.id,
							})
						);
						break;
					case 'callAnswer': {
						const callee = (await Chats_Users.get_users_by_chat(
								data.target_chat)).find((id) => id != data.caller_id);
						send_data = {
							answer: data.answer,
							callee: callee,
						}
						target_id = data.caller_id
						type = "callAnswer";
						break;
					}
					case 'callOffer':
						send_data = {
							caller_id: data.caller_id,
							offer: data.offer,
							video: data.video,
						}
						if (data.target_id === undefined)
							target_id = (await Chats_Users.get_users_by_chat(
								data.target_chat)).find((id) => id != data.caller_id);
						type = "callOffer";
						break;
					case 'IceCandidate':
						send_data = {
							candidate: data.candidate,
						}
						type = "ice-candidate";
						if (data.target_id === undefined || data.target_id == 0)
							target_id = (await Chats_Users.get_users_by_chat(
								data.target_chat)).find((id) => id != data.caller_id);
						break;
					case 'callReject':
						type = 'callReject';
						break;
					case 'endCall':
						type = 'endCall';
						send_data = {
							caller_id: data.caller_id,
						}
						if (data.target_id === 0)
							target_id = (await Chats_Users.get_users_by_chat(
								data.target_chat)).find((id) => id != data.caller_id);
						break;
					default:
						console.log('Unknown notif type', data.type);
						break;
				}
				if (send_data !== undefined) {
					if (target_id == undefined)
						target_id = data.target_id;
					post_notif(
						target_id,
						JSON.stringify(send_data), 
						'',
						type
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
	let notifs_serialize: NotifType;
	if (type == 'new') {
		const notif = new Notif(content, user_id, redirect);
		await notif.create();
		notifs_serialize = notif.serialize();
		
	}
	else {
		notifs_serialize = {
			content: content,
			redirect: redirect,
			id: -1,
			send_at: Number(BigInt(Date.now())),
		}
	}
	const ws = connectedUsers.get(user_id);
	if (ws) {
		ws.send(
			JSON.stringify({
				type,
				notif: notifs_serialize,
			})
		);
	}
}

app.notFound((c: Context) => {
	return c.json({ message: 'Route not Found' }, 404);
});

export default app;