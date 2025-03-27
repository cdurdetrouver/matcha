import { UserType } from "../types/user.ts";
import { client } from "../main.ts";

const TABLE = "users";

export class User {
	username: string;
	password: string;
	email: string;
	avatar?: string ;
	online: boolean = false;
	id: number = 0;
	created_at: number = Date.now();

	[key: string]: unknown;
	constructor(username: string, password: string, email: string) {
		this.username = username;
		this.password = password;
		this.email = email;
	}

	async save(){
		await client.queryObject(`
			UPDATE "${TABLE}"
			SET
				username = $1,
				password = $2,
				email = $3,
				photo_id = $4,
				online = $5,
				chat_ids = $6,
				created_at = $7
			WHERE id = $8;
		`, [this.username, this.password, this.email, this.photo_id, this.online, this.chat_ids, this.created_at, this.id]);
	}

	static async init_table(){
		await client.queryObject(`
			CREATE TABLE IF NOT EXISTS "${TABLE}" (
				id SERIAL PRIMARY KEY,
				username TEXT NOT NULL,
				password TEXT NOT NULL,
				email TEXT NOT NULL,
				photo_id TEXT,
				online BOOLEAN NOT NULL,
				created_at BIGINT NOT NULL
			);
		`);
	}

	async create(){
		const res = await client.queryObject<{id :number}>(`
			INSERT INTO "${TABLE}" (username, password, email, photo_id, online, chat_ids, created_at) 
			VALUES ($1, $2, $3, $4, $5, $6, $7)
			RETURNING id
		`, [this.username, this.password, this.email, this.photo_id, this.online, this.chat_ids, this.created_at]);
		this.id = res.rows[0].id;
	}

	static async delete(id:number){
		await client.queryObject(`
			DELETE FROM "${TABLE}" WHERE id = $1;
		`, [id]);
	}

	static async get_by_id(id:number): Promise<User | null> {
		const res = await client.queryObject<User>(`
			SELECT * FROM "${TABLE}" WHERE id = $1;
		`, [id]);
		const user = res.rows[0];
		if (user == undefined)
			return null;
		return user;
	}

	static async get_all_by_ids(ids:number[]): Promise<User[]> {
		const res = await client.queryObject<User>(`
			SELECT * FROM "${TABLE}" WHERE id = ANY($1);
		`, [ids]);
		const users = res.rows;
		return users;
	}

	static async get_by_field(field_name:string, field_value:string): Promise<User | null> {
		const res = await client.queryObject<User>(`
			SELECT * FROM "${TABLE}" WHERE ${field_name} = $1;
		`, [field_value]);
		const user = res.rows[0];
		if (user == undefined)
			return null;
		return user;
	}

	serialize(): UserType {
		const user:UserType = {
			username: this.username,
			id: this.id,
			email: this.email,
			created_at: this.created_at,
			avatar: this.avatar,
		}
		return user;
	}
}
