import { UserType } from '../types/user.ts';
import { client, relation_graph } from '../main.ts';
import { Image } from './images.ts';
import { Tags_Users } from './tags_users.ts';
import { createMatchRelation } from '../utils/redis.ts';

const TABLE = 'users';
const USERFIELDS = `
	id,
	username,
	password,
	email,
	online,
	complete_profile,
	email_verif,
	wanted,
	gender,
	sexual_preferences,
	description,
	interests,
	ST_X(location::geometry) AS long,
	ST_Y(location::geometry) AS lat,
	auth_provider,
	created_at,
	connected_at,
	birthdate,
	mbti
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
	lat: number = 0;
	long: number = 0;
	description?: string;
	id: number = 0;
	auth_provider: string = 'email';
	created_at: bigint = BigInt(Date.now());
	connected_at: bigint = BigInt(Date.now());
	birthdate?: string;
	mbti?: string; // Added mbti field

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
			this.description = usernameOrOther.description ?? undefined;
			this.id = usernameOrOther.id ?? 0;
			this.created_at = usernameOrOther.created_at ?? BigInt(Date.now());
			this.lat = usernameOrOther.lat ?? 0;
			this.long = usernameOrOther.long ?? 0;
			this.wanted = usernameOrOther.wanted ?? 0;
			this.connected_at =
				usernameOrOther.connected_at ?? BigInt(Date.now());
			this.auth_provider = usernameOrOther.auth_provider ?? 'email';
			this.birthdate = usernameOrOther.birthdate ?? undefined;
			this.mbti = usernameOrOther.mbti ?? undefined;
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
					location = ST_SetSRID(ST_MakePoint($10, $11), 4326),
					connected_at = $12,
					wanted = $13,
					auth_provider = $14,
					birthdate = $15,
					mbti = $16
				WHERE id = $17;
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
				this.long,
				this.lat,
				this.connected_at,
				this.wanted,
				this.auth_provider,
				this.birthdate,
				this.mbti, // Save mbti
				this.id,
			]
		);
		if (this.complete_profile) {
			await this.udpate_relations();
		}
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
				description TEXT DEFAULT NULL,
				interests VARCHAR(255) ARRAY DEFAULT NULL,
				location GEOGRAPHY(POINT, 4326),
				created_at BIGINT DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000,
				connected_At BIGINT DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000,
				auth_provider VARCHAR(255) NOT NULL,
				birthdate DATE DEFAULT NULL,
				mbti VARCHAR(255) DEFAULT NULL
			);
			CREATE INDEX ON users USING GIST(location);
		`);
	}

	async create() {
		const res = await client.queryObject<{ id: number }>(
			`
				INSERT INTO "${TABLE}" (username, password, email, auth_provider, birthdate, mbti) 
				VALUES ($1, $2, $3, $4, $5, $6)
				RETURNING id
	 		`,
			[
				this.username,
				this.password,
				this.email,
				this.auth_provider,
				this.birthdate,
				this.mbti, // Insert mbti
			]
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
				SELECT ${USERFIELDS} FROM "${TABLE}" WHERE id = ANY($1);
			`,
			[ids]
		);
		return res.rows.map((row) => new User(row));
	}

	static async get_all_by_loc(
		radius: number,
		long: number,
		lat: number
	): Promise<User[]> {
		const res = await client.queryObject<User>(
			`
				SELECT ${USERFIELDS} FROM "${TABLE}" WHERE ST_DWithin(location,
				ST_SetSRID(ST_MakePoint(${long}
				, ${lat}), 4326),
				${radius * 1000});
			`
		);
		return res.rows.map((row) => new User(row));
	}

	async calculateCompatibility(otherUser: User): Promise<number> {
		const maxDistance = 100;
		const maxTags = 10;

		const interests = await Tags_Users.get_tags(this.id);
		const otherInterests = await Tags_Users.get_tags(otherUser.id);
		const similarTags =
			interests?.filter((tag) => otherInterests?.includes(tag)).length ??
			0;
		const normalizedTags = Math.min(similarTags / maxTags, 1);

		const distance = Math.sqrt(
			Math.pow(this.lat - otherUser.lat, 2) +
				Math.pow(this.long - otherUser.long, 2)
		);
		const normalizedDistance = Math.max(0, 1 - distance / maxDistance);

		const wantedMatch = this.wanted === otherUser.wanted ? 1 : 0;

		let sexualPreferencesMatch = 0;
		if (
			this.sexual_preferences &&
			otherUser.sexual_preferences === this.sexual_preferences
		) {
			sexualPreferencesMatch = 1;
		}

		const compatibility =
			normalizedTags * 50 +
			normalizedDistance * 30 +
			wantedMatch * 10 +
			sexualPreferencesMatch * 10;

		return Math.round(compatibility);
	}

	static async get_by_field(
		field_name: string,
		field_value: string
	): Promise<User[]> {
		const res = await client.queryObject<User>(
			`
				SELECT ${USERFIELDS} FROM "${TABLE}" WHERE ${field_name} = $1;
			`,
			[field_value]
		);
		return res.rows.map((row) => new User(row));
	}

	static async getall(): Promise<User[]> {
		const res = await client.queryObject<User>(
			`
				SELECT ${USERFIELDS} FROM "${TABLE}";
			`
		);
		return res.rows.map((row) => new User(row));
	}

	async udpate_relations() {
		const nearbyUsers = await User.get_all_by_loc(
			1000000,
			this.lat,
			this.long
		);

		for (const otherUser of nearbyUsers) {
			if (this.id !== otherUser.id) {
				await this.update_relation(otherUser);
			}
		}
		console.log(`Relation graph updated for user ${this.id}`);
	}

	async update_relation(otherUser: User) {
		const weight = await this.calculateCompatibility(otherUser);
		await createMatchRelation(
			this.id,
			otherUser.id,
			weight,
			relation_graph
		);
		console.log('update');
	}

	async serialize(): Promise<UserType> {
		const avatar = await Image.get_avatar_by_user(this.id);
		const interests = await Tags_Users.get_tags(this.id);
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
			interests: interests,
			location: [Number(this.lat), Number(this.long)],
			auth_provider: this.auth_provider,
			birthdate: this.birthdate,
			mbti: this.mbti,
		};
		return user;
	}

	async serialize_me(): Promise<UserType> {
		const user: UserType = await this.serialize();
		user.email = this.email;
		return user;
	}
}
