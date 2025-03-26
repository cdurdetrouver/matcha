import { connect } from "ts-postgres";
import { User } from '../types/user.ts';
import { Chat } from "../types/chat.ts";
import { Message } from "../types/message.ts";
import { Notif } from "../types/notifs.ts";
import { client } from '../main.ts';
import type { response } from '../types/response.ts';

export async function db_connect() {
	const clt = await connect({
		"host": 'db',
		"port": 5432,
		"database": 'matcha',
		"user": 'postgresuser',
		"password": 'postgrespassword'});

	return clt;
}

export async function db_obj_init(table:string, props:string[], contraints:string[]): Promise<boolean> {
	let query;
	
	query = `CREATE TABLE IF NOT EXISTS "${table}" (`;
	let i = 0;
	for (const y in props) {
		query += `${props[y]} `;
		if (contraints && i < contraints.length) {
			query += `${contraints[i]}`;
			if (props[y] != props[props.length - 1])
				query += ', ';
			i++;
		}
	}
	query += ');';
	const result = await client.query(query)
	.then(() => {
		return true;
	})	
	.catch(() => {
		console.error(`DB Error : init request of ${table} failed`);
		return false;
	});
	return result;
}

export async function db_init(): Promise<boolean> {
	const contraints_user = ["VARCHAR(255) NOT NULL",  "VARCHAR(255) NOT NULL",  "VARCHAR(255) NOT NULL", "INTEGER", "BOOLEAN", "INTEGER ARRAY", "SERIAL PRIMARY KEY", "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP"];
	const contraints_chat = ["VARCHAR(255) NOT NULL",  "INTEGER ARRAY",  "INTEGER ARRAY", "INTEGER", "SERIAL PRIMARY KEY", "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP"];
	const contraints_message = ["VARCHAR(255) NOT NULL",  "INTEGER ARRAY",  "VARCHAR(255) NOT NULL", "SERIAL PRIMARY KEY", "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP"];
	const contraints_notifs = ["VARCHAR(255) NOT NULL",  "VARCHAR(255) NOT NULL",  "VARCHAR(255) NOT NULL", "INTEGER", "SERIAL PRIMARY KEY", "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP"];

	const result_user:boolean = await db_obj_init("user", User.getPropertyNames(), contraints_user);
	const result_chat:boolean = await db_obj_init("chat", Chat.getPropertyNames(), contraints_chat);
	const result_message:boolean = await db_obj_init("message", Message.getPropertyNames(), contraints_message);
	const result_notif:boolean = await db_obj_init("notifs", Notif.getPropertyNames(), contraints_notifs);

	if (!result_user || !result_chat || !result_message || !result_notif)
		return false;
	db_print_table("user");
	return true;
}

export async function db_print_table(table: string) {
	const query = `SELECT *  FROM "${table}";`;

	await client.query(query)
	.then(data => {
		console.log('Success:', data);
	})
	.catch((error) => {
		console.error(`DB Error : db print failed -> `, error);
	});
}

export async function db_get_number_obj(table: string): Promise<number | boolean> {
	const query = 'SELECT COUNT(*) FROM "user" WHERE id = NOT NULL;';

	const result = await client.query(query)
	.then(data => {
		const nb = parseInt(data['rows'][0][0]);
		return nb;
	})
	.catch(() => {
		console.error(`UserDB Error : can't find number of objects in ${table}`);
		return false;
	});
	return result;
}

export async function db_post_obj(table: string, obj: Record<string, unknown>): Promise<boolean> {
	let query;

	query = `INSERT INTO "${table}" (`;
	for (const y in obj) {
		query += `${y}`;
		if (y != Object.keys(obj)[Object.keys(obj).length - 3])
			query += ', ';
		else
			break;
	}
	query += ') VALUES (';
	for (const y in obj) {
		if (Array.isArray(obj[y])) {
			if (obj[y].length == 0)
				query += "'{NULL}'";
			else
				query += `'{${obj[y].join(",")}}'`;
		}
		else
			query += `'${obj[y]}'`;
		if (y != Object.keys(obj)[Object.keys(obj).length - 3])
			query += ', ';
		else
			break;
	}
	query += ');';

	console.log(query);
	const result = await client.query(query)
	.then(() => {
		return true;
	})
	.catch(() => {
		console.error(`DB Error : can't store in ${table}`);
		return false;
	});
	return result;
}

export async function db_put_obj(table: string, id: number, obj: Record<string, unknown>): Promise<boolean> {
	let query = `UPDATE "${table}" SET `;

	for (const y in obj) {
		query += `${y} = '${obj[y]}'`;
		if (y != Object.keys(obj)[Object.keys(obj).length - 3])
			query += ', ';
		else
			 break;
	}
 
	query += ` WHERE "id" = ${id};`;
	const result = await client.query(query)
	.then(() => {
		return true;
	})
	.catch(() => {
		console.error(`DB Error : can't UPDATE in ${table}`);
		return false;
	});
	return result;
}

export async function db_get_obj_by_id(table: string, id: number): Promise<response | null> {
	const query = `SELECT *  FROM "${table}" WHERE id = '${id}';`;

	console.log(query);
	const result = await client.query(query)
	.then(data => {
		return(data);
	})
	.catch(() => {
		console.error(`DB Error : db get failed for ${id} in ${table}`);
		return null;
	});
	return result;
}



export async function db_get_obj_custom(table: string, custom: string, custom_value: string): Promise<response | null> {
	const query = `SELECT *  FROM "${table}" WHERE ${custom} = '${custom_value}';`;

	const result = await client.query(query)
	.then(data => {
		return data;
	})
	.catch(() => {
		console.error(`DB Error : db get failed for ${custom} in ${table}`);
		return null;
	});
	return result;
}

export async function db_delete_obj(table: string, id: number): Promise<boolean> {
	const query = `DELETE FROM "${table}" WHERE id = ${id};`;

	const result = await client.query(query)
	.then(() => {
		return true;
	})
	.catch(() => {
		console.error(`DB Error : can't destroy in ${table}`);
		return false;
	});
	return result;
}