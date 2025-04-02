import { UserType } from '../types/user.ts';
import { client } from '../main.ts';

const TABLE = 'users';

export class User {
	username: string;
	password: string;
	email: string;
	avatar?: string;
	online: boolean = false;
	id: number = 0;
	created_at: bigint = BigInt(Date.now());

	constructor(
		usernameOrOther: string | Partial<User>,
		password?: string,
		email?: string
	) {
		if (typeof usernameOrOther === 'object' && usernameOrOther !== null) {
			this.username = usernameOrOther.username!;
			this.password = usernameOrOther.password!;
			this.email = usernameOrOther.email!;
			this.avatar = usernameOrOther.avatar;
			this.online = usernameOrOther.online ?? false;
			this.id = usernameOrOther.id ?? 0;
			this.created_at = usernameOrOther.created_at ?? BigInt(Date.now());
		} else {
			this.username = usernameOrOther;
			this.password = password!;
			this.email = email!;
		}
	}

	async save() {
		await client.queryObject(
			`
				UPDATE "${TABLE}"
				SET
					username = $1,
					password = $2,
					email = $3,
					avatar = $4,
					online = $5
				WHERE id = $6;
			`,
			[
				this.username,
				this.password,
				this.email,
				this.avatar,
				this.online,
				this.id,
			]
		);
	}

	static async init_table() {
		await client.queryObject(`
			CREATE TABLE IF NOT EXISTS "${TABLE}" (
				id SERIAL PRIMARY KEY,
				username VARCHAR(255) NOT NULL UNIQUE,
				password VARCHAR(255) NOT NULL,
				email VARCHAR(255) NOT NULL UNIQUE,
				avatar VARCHAR(255) DEFAULT NULL,
				online BOOLEAN DEFAULT FALSE,
				created_at BIGINT DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000
			);
		`);
	}

	async create() {
		const res = await client.queryObject<{ id: number }>(
			`
				INSERT INTO "${TABLE}" (username, password, email, avatar, online) 
				VALUES ($1, $2, $3, $4, $5)
				RETURNING id
	 		`,
			[this.username, this.password, this.email, this.avatar, this.online]
		);
		this.id = res.rows[0].id;
	}

	static async delete(id: number) {
		await client.queryObject(
			`
				DELETE FROM "${TABLE}" WHERE id = $1;
			`,
			[id]
		);
	}

	static async get_by_id(id: number): Promise<User> {
		const res = await client.queryObject<User>(
			`
				SELECT * FROM "${TABLE}" WHERE id = $1;
			`,
			[id]
		);
		const user = res.rows[0];
		if (user == undefined) throw Error();
		return new User(user);
	}

	static async get_all_by_ids(ids: number[]): Promise<User[]> {
		const res = await client.queryObject<User>(
			`
				SELECT * FROM "${TABLE}" WHERE id = ANY($1);
			`,
			[ids]
		);
		return res.rows.map((row) => new User(row));
	}

	static async get_by_field(
		field_name: string,
		field_value: string
	): Promise<User> {
		const res = await client.queryObject<User>(
			`
				SELECT * FROM "${TABLE}" WHERE ${field_name} = $1;
			`,
			[field_value]
		);
		const user = res.rows[0];
		if (user == undefined) throw Error();
		return new User(user);
	}

	static async getall(): Promise<User[]> {
		const res = await client.queryObject<User>(
			`
				SELECT * FROM "${TABLE}";
			`
		);
		return res.rows.map((row) => new User(row));
	}

	serialize(): UserType {
		const user: UserType = {
			username: this.username,
			id: this.id,
			created_at: Number(this.created_at),
			avatar: this.avatar,
		};
		return user;
	}

	serialize_me(): UserType {
		const user: UserType = {
			username: this.username,
			id: this.id,
			email: this.email,
			created_at: Number(this.created_at),
			avatar: this.avatar,
		};
		return user;
	}
}
