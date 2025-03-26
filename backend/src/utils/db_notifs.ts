import { response } from "../types/response.ts";
import { Notif } from "../types/notifs.ts";
import { db_get_obj_custom, db_get_obj_by_id } from "./db_actions.ts";

export async function db_get_notif_custom(custom: string, custom_value: string):Promise<Notif | null>{
	const response:response | null = await db_get_obj_custom("notif", custom, custom_value);
	if (response == null)
		return null;
	if (response.rows.length == 0)
		return null;
	const rows = response['rows'][0];
	return new Notif(...rows);
}

export async function db_get_notif(id: number): Promise<Notif | null> {
	const response: response | null = await db_get_obj_by_id("notif", id);
	if (response == null)
		return null;
	if (response.rows.length == 0)
		return null;
	const rows = response['rows'][0];
	return new Notif(...rows);
}