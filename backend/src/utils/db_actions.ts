import { connect } from "ts-postgres";
import User from '../types/user.ts';
import { client } from '../main.ts';
import type response from '../types/response.ts';

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
		query += `${y} `;
		if (contraints && i < contraints.length) {
			query += `${contraints[i]}`;
			if (y != props[props.length - 1])
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
	const contraints = ["VARCHAR(255) NOT NULL",  "VARCHAR(255) NOT NULL",  "VARCHAR(255) NOT NULL", "SERIAL PRIMARY KEY", "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP"];
	const result:boolean = await db_obj_init("user", User.getPropertyNames(), contraints);
	if (!result)
		return false;
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
		console.error(`DB Error : can't find number of objects in ${table}`);
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
		query += `'${obj[y]}'`;
		if (y != Object.keys(obj)[Object.keys(obj).length - 3])
			query += ', ';
		else
			break;
	}
	query += ');';

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