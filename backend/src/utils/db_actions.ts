import { connect } from 'ts-postgres';
import { user } from '../types/user.ts';
import { client } from '../main.ts';

export async function db_connect() {
	const clt = await connect({
		"host": 'db',
		"port": 5432,
		"database": 'matcha',
		"user": 'postgresuser',
		"password": 'postgrespassword'});

	return clt;
}

export async function db_obj_init(table, obj, contraints) {
	let query;
	let i = 0;

	query = `CREATE TABLE IF NOT EXISTS "${table}" (`;
	for (var y in obj) {
	   
		query += `${y} `;
		if (contraints && i < contraints.length) {
			query += `${contraints[i]}`;
			if (y != Object.keys(obj)[Object.keys(obj).length - 1])
				query += ', ';
			i++;
		}
	}
	query += ');';
	const result = await client.query(query)
	.then(data => {
		return true;
	})	
	.catch((error) => {
		console.error(`DB Error : init request of ${table} failed`);
		return false;
	});
}

export async function db_init() {
	let user_init = new user;
	const contraints = ["VARCHAR(255) NOT NULL",  "VARCHAR(255) NOT NULL",  "VARCHAR(255) NOT NULL", "SERIAL PRIMARY KEY", "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP"];
	if (!db_obj_init("user", user_init, contraints, client))
		return false;
	db_print_table("user");
	return true;
}

export async function db_print_table(table) {
	const query = `SELECT *  FROM "${table}";`;

	const result = await client.query(query)
	.then(data => {
		console.log('Success:', data);
	})
	.catch((error) => {
		console.error(`DB Error : db print failed -> `, error);
	});
}

export async function db_get_number_obj(table) {
	const query = 'SELECT COUNT(*) FROM "user" WHERE id = NOT NULL;';

	const result = await client.query(query)
	.then(data => {
		const nb = parseInt(data['rows'][0][0]);
		return (nb);
	})
	.catch((error) => {
		console.error(`DB Error : can't find number of objects in ${table}`);
		return (-1);
	});
	return result;
}

export async function db_post_obj(table, obj, len) {
	let query;

	query = `INSERT INTO "${table}" (`;
	for (var y in obj) {
		query += `${y}`;
		if (y != Object.keys(obj)[Object.keys(obj).length - len])
			query += ', ';
		else
			break;
	}
	query += ') VALUES (';
	for (var y in obj) {
		query += `'${obj[y]}'`;
		if (y != Object.keys(obj)[Object.keys(obj).length - len])
			query += ', ';
		else
			break;
	}
	query += ');';

	const result = await client.query(query)
	.then(data => {
		return (1);
	})
	.catch((error) => {
		console.error(`DB Error : can't store in ${table}`);
		return (-1);
	});
	return result;
}

export async function db_put_obj(table: string, id: number, obj) {
	let query = `UPDATE "${table}" SET `;

	for (var y in obj) {
		query += `${y} = '${obj[y]}'`;
		if (y != Object.keys(obj)[Object.keys(obj).length - 3])
			query += ', ';
		else
			 break;
	}
 
	query += ` WHERE "id" = ${id};`;
	const result = await client.query(query)
	.then(data => {
		return (1);
	})
	.catch((error) => {
		console.error(`DB Error : can't UPDATE in ${table}`);
		return (-1);
	});
	return result;
}

export async function db_get_obj_by_id(table: string, id: number) {
	const query = `SELECT *  FROM "${table}" WHERE id = '${id}';`;

	const result = await client.query(query)
	.then(data => {
		return(data);
	})
	.catch((error) => {
		console.error(`DB Error : db get failed for ${id} in ${table}`);
		return (-1);
	});
	return result;
}

export async function db_get_obj_custom(table: string, custom: string, custom_value: string) {
	const query = `SELECT *  FROM "${table}" WHERE ${custom} = '${custom_value}';`;

	const result = await client.query(query)
	.then(data => {
		return(data);
	})
	.catch((error) => {
		console.error(`DB Error : db get failed for ${custom} in ${table}`);
		return (-1);
	});
	return result;
}

export async function db_get_user_custom(custom: string, custom_value: string) {
	const response = await db_get_obj_custom("user", custom, custom_value);
	if (response == -1 || response['rows'].length == 0)
		return (-1);
	const rows = response['rows'][0];
	let user_get = new user(null, null, null, rows);
	return user_get;
}

export async function db_get_user(id: number) {
	const response = await db_get_obj_by_id("user", id);
	if (response == -1 || response['rows'].length == 0)
		return (-1);
	const rows = response['rows'][0];
	let user_get = new user(null, null, null, rows);
	return user_get;
}

export async function db_delete_obj(table, id) {
	let query;

	query = `DELETE FROM "${table}" WHERE id = ${id};`;

	const result = await client.query(query)
	.then(data => {
		return 1
	})
	.catch((error) => {
		console.error(`DB Error : can't destroy in ${table}`);
		return (-1);
	});
	return result;
}