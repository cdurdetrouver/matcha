import { Message } from "../db_objects/messages.ts";
import { WSContext } from "hono/ws";


export function joinGroup(chat_id: number, socket: WSContext<WebSocket>, chan_layer: Map<number, Set<WSContext<WebSocket>>>) {
	if (!chan_layer.has(chat_id))
		chan_layer.set(chat_id, new Set());
	chan_layer.get(chat_id)!.add(socket);
}
  
export function leaveGroup(chat_id: number, socket: WSContext<WebSocket>, chan_layer: Map<number, Set<WSContext<WebSocket>>>) {
	if (chan_layer.has(chat_id)) {
		chan_layer.get(chat_id)!.delete(socket);

		if (chan_layer.get(chat_id)!.size === 0)
			chan_layer.delete(chat_id);
	}
}
  
export async function broadcastToGroup(chat_id: number, message: Message, chan_layer: Map<number, Set<WSContext<WebSocket>>>) {
	const sockets = chan_layer.get(chat_id);
	if (sockets) {
		for (const socket of sockets) {
			try {
				socket.send(JSON.stringify({message:await message.serialize()}));
			} catch (err) {
				console.error("Error sending to socket:", err, "\nmessage:", await message.serialize());
			}
		}
	}
}