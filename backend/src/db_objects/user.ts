import { UserType } from '../types/user.ts';
import { client } from '../main.ts';
import { Image } from "./images.ts";

const TABLE = 'users';

export class User {
	username: string;
	password: string;
	email: string;
	avatar?: string;
	online: boolean = false;
	complete_profile: boolean = false;
	lover: boolean = false;
	friendly: boolean = false;
	gender?: string;
	sexual_preferences?: string;
	interests?: string[];
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
			this.complete_profile = usernameOrOther.complete_profile ?? false;
			this.gender = usernameOrOther.gender ?? undefined;
			this.sexual_preferences = usernameOrOther.sexual_preferences ?? undefined;
			this.interests = usernameOrOther.interests ?? undefined;
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
					online = $5,
					complete_profile = $6,
					gender = $7,
					sexual_preferences = $8,
					interests = $9
				WHERE id = $10;
			`,
			[
				this.username,
				this.password,
				this.email,
				this.avatar,
				this.online,
				this.complete_profile,
				this.gender,
				this.sexual_preferences,
				this.interests,
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
				complete_profile BOOLEAN DEFAULT FALSE,
				gender VARCHAR(255) DEFAULT NULL,
				sexual_preferences VARCHAR(255) DEFAULT NULL,
				interests VARCHAR(255) ARRAY DEFAULT NULL,
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

	async serialize(): Promise<UserType> {
		const avatar: Image = await Image.get_by_field('filename', this.avatar!);
		const user: UserType = {
			username: this.username,
			id: this.id,
			created_at: Number(this.created_at),
			avatar: await avatar.serialize(),
		};
		return user;
	}

	async serialize_me(): Promise<UserType> {
		let avatar;
		try {
			avatar = await Image.get_by_field('filename', this.avatar!);
			avatar = await avatar.serialize();
		}
		catch (_e) {
			avatar = undefined;
		}
		const user: UserType = {
			username: this.username,
			id: this.id,
			email: this.email,
			created_at: Number(this.created_at),
			avatar: avatar,
		};
		return user;
	}
}
