import { Client } from "https://deno.land/x/postgres@v0.19.3/mod.ts";
import { User } from "../db_objects/user.ts";
import { Chats_Users } from "../db_objects/chats_users.ts";

export function db_connect() {
	const clt = new Client({
		hostname: 'db',
		port: 5432,
		database: 'matcha',
		user: 'postgresuser',
		password: 'postgrespassword'
	});
	return clt;
}

export async function init_db() {
	await User.init_table();
	await Chats_Users.init_table();
}
