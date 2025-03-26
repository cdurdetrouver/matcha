import { response } from "../types/response.ts";
import { Chat } from "../types/chat.ts";
import { db_get_obj_custom, db_get_obj_by_id } from "./db_actions.ts";

export async function db_get_chat_custom(custom: string, custom_value: string):Promise<Chat | null>{
	const response:response | null = await db_get_obj_custom("chat", custom, custom_value);
	if (response == null)
		return null;
	if (response.rows.length == 0)
		return null;
	const rows = response['rows'][0];
	return new Chat(...rows);
}

export async function db_get_chat(id: number): Promise<Chat | null> {
	const response: response | null = await db_get_obj_by_id("chat", id);
	if (response == null)
		return null;
	if (response.rows.length == 0)
		return null;
	const rows = response['rows'][0];
	return new Chat(...rows);
}