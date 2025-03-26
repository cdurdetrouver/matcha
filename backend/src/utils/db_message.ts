import { response } from "../types/response.ts";
import { Message } from "../types/message.ts";
import { db_get_obj_custom, db_get_obj_by_id } from "./db_actions.ts";

export async function db_get_message_custom(custom: string, custom_value: string):Promise<Message | null>{
	const response:response | null = await db_get_obj_custom("message", custom, custom_value);
	if (response == null)
		return null;
	if (response.rows.length == 0)
		return null;
	const rows = response['rows'][0];
	return new Message(...rows);
}

export async function db_get_message(id: number): Promise<Message | null> {
	const response: response | null = await db_get_obj_by_id("message", id);
	if (response == null)
		return null;
	if (response.rows.length == 0)
		return null;
	const rows = response['rows'][0];
	return new Message(...rows);
}