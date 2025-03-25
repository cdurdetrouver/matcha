import response from "../types/response.ts";
import User from "../types/user.ts";
import { db_get_obj_custom, db_get_obj_by_id } from "./db_actions.ts";

export async function db_get_user_custom(custom: string, custom_value: string):Promise<User | null>{
	const response:response | null = await db_get_obj_custom("user", custom, custom_value);
	if (response == null)
		return null;
	if (response.rows.length == 0)
		return null;
	const rows = response['rows'][0];
	return new User(rows[0], rows[1], rows[2], rows[3], rows[4]);
}

export async function db_get_user(id: number): Promise<User | null> {
	const response: response | null = await db_get_obj_by_id("user", id);
	if (response == null)
		return null;
	if (response.rows.length == 0)
		return null;
	const rows = response['rows'][0];
	return new User(rows[0], rows[1], rows[2], rows[3], rows[4]);
}
