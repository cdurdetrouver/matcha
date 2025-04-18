import { UserType } from '../types/user.ts';
import { client } from '../main.ts';
import { Image } from './images.ts';

const TABLE = 'users';
const USERFIELDS = `
	id,
	username,
	password,
	email,
	online,
	complete_profile,
	wanted,
	gender,
	sexual_preferences,
	description,
	interests,
	ST_X(location::geometry) AS long,
	ST_Y(location::geometry) AS lat,
	created_at,
	connected_at
`;

export class User {
	username: string;
	password: string;
	email: string;
	online: boolean = false;
	complete_profile: boolean = false;
	email_verif: boolean = false;
	wanted: number = 0;
	gender?: string;
	sexual_preferences?: string;
	interests?: string[];
	lat: number = 0;
	long: number = 0;
	description?: string;
	id: number = 0;
	created_at: bigint = BigInt(Date.now());
	connected_at: bigint = BigInt(Date.now());

	constructor(
		usernameOrOther: string | Partial<User>,
		password?: string,
		email?: string
	) {
		if (typeof usernameOrOther === 'object' && usernameOrOther !== null) {
			this.username = usernameOrOther.username!;
			this.password = usernameOrOther.password!;
			this.email = usernameOrOther.email!;
			this.online = usernameOrOther.online ?? false;
			this.complete_profile = usernameOrOther.complete_profile ?? false;
			this.email_verif = usernameOrOther.email_verif ?? false;
			this.gender = usernameOrOther.gender ?? undefined;
			this.sexual_preferences =
				usernameOrOther.sexual_preferences ?? undefined;
			this.interests = usernameOrOther.interests ?? undefined;
			this.description = usernameOrOther.description ?? undefined;
			this.id = usernameOrOther.id ?? 0;
			this.created_at = usernameOrOther.created_at ?? BigInt(Date.now());
			this.connected_at =
				usernameOrOther.connected_at ?? BigInt(Date.now());
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
					online = $4,
					complete_profile = $5,
					email_verif = $6,
					gender = $7,
					sexual_preferences = $8,
					description = $9,
					interests = $10,
					location = ST_SetSRID(ST_MakePoint($10, $11), 4326),
					connected_at = $12,
					wanted = $13
				WHERE id = $14;
			`,
			[
				this.username,
				this.password,
				this.email,
				this.online,
				this.complete_profile,
				this.email_verif,
				this.gender,
				this.sexual_preferences,
				this.description,
				this.interests,
				this.long,
				this.lat,
				this.connected_at,
				this.wanted,
				this.id,
			]
		);
	}

	static async init_table() {
		await client.queryObject(`
			CREATE EXTENSION IF NOT EXISTS postgis;

			CREATE TABLE IF NOT EXISTS "${TABLE}" (
				id SERIAL PRIMARY KEY,
				username VARCHAR(255) NOT NULL UNIQUE,
				password VARCHAR(255) NOT NULL,
				email VARCHAR(255) NOT NULL UNIQUE,
				online BOOLEAN DEFAULT FALSE,
				wanted INTEGER DEFAULT 0,
				complete_profile BOOLEAN DEFAULT FALSE,
				email_verif BOOLEAN DEFAULT FALSE,
				gender VARCHAR(255) DEFAULT NULL,
				sexual_preferences VARCHAR(255) DEFAULT NULL,
				description VARCHAR(255) DEFAULT NULL,
				interests VARCHAR(255) ARRAY DEFAULT NULL,
				location GEOGRAPHY(POINT, 4326),
				created_at BIGINT DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000,
				connected_At BIGINT DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000
			);
			CREATE INDEX ON users USING GIST(location);
		`);
	}

	async create() {
		const res = await client.queryObject<{ id: number }>(
			`
				INSERT INTO "${TABLE}" (username, password, email, online) 
				VALUES ($1, $2, $3, $4)
				RETURNING id
	 		`,
			[this.username, this.password, this.email, this.online]
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
				SELECT ${USERFIELDS} FROM "${TABLE}" WHERE id = $1;
			`,
			[id]
		);
		const user = res.rows[0];
		if (user == undefined) throw Error('User not found');
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

	async get_all_by_loc(radius: number): Promise<User[]> {
		const res = await client.queryObject<User>(
			`
				SELECT * FROM "${TABLE}" WHERE ST_DWithin(location,
				ST_SetSRID(ST_MakePoint(${this.long}
				, ${this.lat}), 4326),
        		${radius * 1000});
			`,
		);
		return res.rows.map((row) => new User(row));
	}

	async get_posts_users_by_loc(radius: number): Promise<User[]> {
		const res = await client.queryObject<User>(
			`

			SELECT * FROM "${TABLE}" 
			WHERE ST_DWithin(
				location,
				ST_SetSRID(ST_MakePoint(${this.long},
				${this.lat}), 4326), ${radius * 1000})
			AND id != ${this.id}
			AND id NOT IN (
				SELECT seen_id FROM seen_users
				WHERE user_id = ${this.id}
			);
		`,
		);
		return res.rows.map((row) => new User(row));
	}

	static async get_by_field(
		field_name: string,
		field_value: string
	): Promise<User[]> {
		const res = await client.queryObject<User>(
			`
				SELECT * FROM "${TABLE}" WHERE ${field_name} = $1;
			`,
			[field_value]
		);
		return res.rows.map((row) => new User(row));
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
		const avatar = await Image.get_avatar_by_user(this.id);
		const user: UserType = {
			username: this.username,
			id: this.id,
			created_at: Number(this.created_at),
			connected_at: Number(this.connected_at),
			avatar: await avatar.serialize(),
			complete_profile: this.complete_profile,
			email_verif: this.email_verif,
			online: this.online,
			wanted: this.wanted,
			gender: this.gender,
			sexual_preferences: this.sexual_preferences,
			description: this.description,
			interests: this.interests,
			location: [this.lat, this.long],
		};
		return user;
	}

	async serialize_me(): Promise<UserType> {
		let avatar;
		try {
			avatar = await Image.get_avatar_by_user(this.id);
			avatar = await avatar.serialize();
		} catch (_e) {
			avatar = undefined;
		}
		const user: UserType = {
			username: this.username,
			id: this.id,
			email: this.email,
			created_at: Number(this.created_at),
			connected_at: Number(this.connected_at),
			avatar: avatar,
			complete_profile: this.complete_profile,
			email_verif: this.email_verif,
			online: this.online,
			wanted: this.wanted,
			gender: this.gender,
			sexual_preferences: this.sexual_preferences,
			description: this.description,
			interests: this.interests,
			location: [this.lat, this.long],
		};
		return user;
	}
}
