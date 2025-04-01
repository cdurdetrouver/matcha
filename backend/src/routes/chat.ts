import { Hono, type Context } from 'hono';
import { broadcastToGroup, joinGroup, leaveGroup } from "../utils/channels_layer.ts";
import { check_cookies } from "../utils/jwt.ts";
import { Chat } from "../db_objects/chats.ts";
import { User } from "../db_objects/user.ts";
import { Message } from "../db_objects/messages.ts";
import { Chats_Users } from "../db_objects/chats_users.ts";
import { upgradeWebSocket } from "hono/deno";
import { WSContext } from "hono/ws";
import { MessageType } from "../types/message.ts";


const app = new Hono()

const chan_layer = new Map<number, Set<WSContext<WebSocket>>>();

app.get('/:chat_id/:message_id/:after_id', async(c:Context) => {
	const chat_id = Number(c.req.param('chat_id'));
	const message_id = Number(c.req.param('message_id'));
	const after_id: boolean = c.req.param('after_id') === 'true' ? true: false;
	console.log(after_id)
	const ret_check = await check_cookies(c);
	let chat: Chat;

	if (chat_id == undefined || message_id == undefined || after_id == undefined)
	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !'}, 400);
	const { message, ret_val, user } = ret_check;
	if ( user == null || message != undefined)
		return c.json({message: message}, ret_val);
	try {
		chat = await Chat.get_by_id(chat_id);
	}
	catch (_e) {
		return c.json({message: "Chat not found"}, 404);
	}
	const messages = await Message.get_10_mess_by_id(message_id, after_id, chat.id);
	messages.reverse();
	const messages_serialized: MessageType[] = await Promise.all(messages.map(async (message: Message) => await message.serialize()));
	return c.json({history: messages_serialized}, 200);
});

app.put('/:id', async(c: Context) => {
	const body = await c.req.json();
	const id = Number(c.req.param('id'));
	const ret_check = await check_cookies(c);
	let chat: Chat;

	if (ret_check == null)
		return c.json({ message: 'Server cannot perform checks !'}, 400);
	const { message, ret_val, user } = ret_check;
	if ( user == null || message != undefined)
		return c.json({message: message}, ret_val);
	try {
		chat = await Chat.get_by_id(id);
	}
	catch (_e) {
		return c.json({message: "Chat not found"}, 404);
	}
	chat.name, chat.photo_id = body.name, body.photo_id;
	await chat.save();
	return c.json({message: "Chat successfully updated"});
});

app.get("/:id", upgradeWebSocket( async (c: Context) => {
	let chat: Chat, user_chat : User;
	
	const id = Number(c.req.param('id'));
	const ret_check = await check_cookies(c);
	return {

		onOpen: async (_event, ws) => {
			let last_message: Message;
			ws.send("WebSocket connection opened");
			if (ret_check == null) {
				ws.send(JSON.stringify({error: 'Server cannot perform checks !'}));
				return ;
			}
			const { message, user, ret_val } = ret_check;
			if (message != undefined || user == null) {
				if (message)
					ws.send(JSON.stringify({error: message}));
				else
					ws.send(JSON.stringify({error: 'Server cannot perform checks !'}));
				ws.close(ret_val);
				return ;
			}
			try {
				chat = await Chat.get_by_id(id);
			}
			catch (_e) {
				ws.send(JSON.stringify({error: "chat not found"}));
				ws.close(404);
				return ;
			}
			if (!((await Chats_Users.get_chats_by_user(user.id))).includes(chat.id)) {
				ws.send(JSON.stringify({error: "User not in the chat"}));
				ws.close(403);
				return ;
			}
			user_chat = new User(user);
			joinGroup(chat.id, ws, chan_layer);
			try {
				last_message = await Message.get_last_message(chat.id);
			}
			catch (_e) {
				ws.send(JSON.stringify({error: "Failed to retrived history"}));
				return ;
			}
			const messages = await Message.get_10_mess_by_id(last_message.id, false, chat.id);
			messages.reverse();
			const messages_serialized: MessageType[] = await Promise.all(messages.map(async (message: Message) => await message.serialize()));
			ws.send(JSON.stringify({history: messages_serialized}));
		},

		onMessage: async (event, ws) => {
			if (typeof event.data != 'string') {
				ws.send(JSON.stringify({error: 'bad message format'}));
				return ;
			}
			const message: Message = new Message (JSON.parse(event.data));
			message.user_id = user_chat.id;
			message.chat_id = chat.id;
			try {
				await message.create();
			}
			catch (_e) {
				console.log(_e);
				ws.send(JSON.stringify({error: "Failed to store message"}));
				return ;
			}
			try {
				const full_message = await Message.get_by_id(message.id);
				console.log(full_message);
				await broadcastToGroup(chat.id, full_message, chan_layer);
			}
			catch (_e) {
				console.log(_e);
				ws.send("Server failed to retrieve message");
				return ;
			}
		},
	
		onClose: (_event, ws) => {
			if (chat != null)
				leaveGroup(chat.id, ws, chan_layer);
			console.log("WebSocket connection closed");
		},

		onError: (event, ws) => {
			console.log(event);
			if (chat != null)
				leaveGroup(chat.id, ws, chan_layer);
			console.error("WebSocket error:", event);
		},
	}
  }));
  

app.notFound((c:Context) => {
	return c.json({ message: 'Route not Found' }, 404)
});


export default app;
