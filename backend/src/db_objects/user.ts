import { UserType } from '../types/user.ts';
import { client, relation_graph, similarity_graph } from '../main.ts';
import { Image } from './images.ts';
import { Tags_Users } from './tags_users.ts';
import { createMatchRelation, getTopWeightedMatches } from '../utils/redis.ts';
import { matchingScore } from '../utils/matching.ts';
import { similarityScore } from '../utils/similarity.ts';
import { filter } from '../utils/filter.ts';

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
	mbti,
	fame_rate,
	insta_link,
	x_link,
	intra_link
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
	fame_rate?: number;
	mbti?: string;
	insta_link?: string;
	x_link?: string;
	intra_link?: string;
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
			this.fame_rate = usernameOrOther.fame_rate ?? 0;
			this.insta_link = usernameOrOther.insta_link ?? undefined;
			this.x_link = usernameOrOther.x_link ?? undefined;
			this.intra_link = usernameOrOther.intra_link ?? undefined;
		} else {
			this.username = usernameOrOther;
			this.password = password!;
			this.email = email!;
		}
	}

	async save() {
		this.description = filter.clean(this.description ?? '');
		if (this.complete_profile) {
			await User.update_all();
		}
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
					mbti = $16,
					fame_rate = $17,
					insta_link = $18,
					x_link = $19,
					intra_link = $20
				WHERE id = $21;
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
				this.mbti,
				this.fame_rate,
				this.insta_link,
				this.x_link,
				this.intra_link,
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
				description TEXT DEFAULT NULL,
				interests VARCHAR(255) ARRAY DEFAULT NULL,
				location GEOGRAPHY(POINT, 4326),
				created_at BIGINT DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000,
				connected_At BIGINT DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000,
				auth_provider VARCHAR(255) NOT NULL,
				birthdate DATE DEFAULT NULL,
				fame_rate FLOAT DEFAULT 0,
				mbti VARCHAR(255) DEFAULT NULL,
				insta_link VARCHAR(255) DEFAULT NULL,
				x_link VARCHAR(255) DEFAULT NULL,
				intra_link VARCHAR(255) DEFAULT NULL
			);
			CREATE INDEX ON users USING GIST(location);
			CREATE OR REPLACE FUNCTION check_email_not_banned()
			RETURNS TRIGGER AS $$
			BEGIN
				IF EXISTS (SELECT 1 FROM "Ban_Users" WHERE email = NEW.email) THEN
					RAISE EXCEPTION 'Email is banned and cannot be used.';
				END IF;
				RETURN NEW;
			END;
			$$ LANGUAGE plpgsql;
		`);
	}

	async create() {
		const res = await client.queryObject<{ id: number }>(
			`
				INSERT INTO "${TABLE}" (username, password, email, auth_provider, birthdate, mbti) 
				VALUES ($1, $2, $3, $4, $5, $6)
				ON CONFLICT (email)
				DO NOTHING
				RETURNING id;
	 		`,
			[
				this.username,
				this.password,
				this.email,
				this.auth_provider,
				this.birthdate,
				this.mbti,
			]
		);
		if (res.rows.length > 0) this.id = res.rows[0].id;
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

	static async get_all_by_famerate(
		fame_rate_min: number,
		fame_rate_max: number
	): Promise<User[]> {
		const res = await client.queryObject<User>(
			`
				SELECT ${USERFIELDS} FROM "${TABLE}" WHERE fame_rate BETWEEN $1 AND $2;
			`,
			[fame_rate_min, fame_rate_max]
		);
		return res.rows.map((row) => new User(row));
	}

	static async get_all_by_age(
		minAge: number,
		maxAge: number
	): Promise<User[]> {
		const res = await client.queryObject<User>(
			`
				SELECT ${USERFIELDS} FROM "${TABLE}" WHERE EXTRACT(YEAR FROM age(birthdate)) BETWEEN $1 AND $2;
			`,
			[minAge, maxAge]
		);
		return res.rows.map((row) => new User(row));
	}

	async get_all_by_loc(
		radius: number,
		long: number,
		lat: number
	): Promise<User[]> {
		const res = await client.queryObject<User>(
			`
				SELECT ${USERFIELDS} FROM "${TABLE}" 
				WHERE ST_DWithin(
					location::geography,
					ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
					$3
				) AND id != $4;
			`,
			[long, lat, radius, this.id]
		);
		return res.rows.map((row) => new User(row));
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

	static async get_by_username_contains(substring: string): Promise<User[]> {
		const res = await client.queryObject<User>(
			`
				SELECT ${USERFIELDS} FROM "${TABLE}" 
				WHERE username ILIKE $1;
			`,
			[`%${substring}%`]
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

	static async update_all() {
		const users = await User.getall();
		for (const user of users) {
			await user.udpate_relations();
		}
	}

	async udpate_relations() {
		const nearbyUsers = await this.get_all_by_loc(
			20000,
			this.long,
			this.lat
		);

		const similar_user: User[] = [];

		for (const otherUser of nearbyUsers) {
			if (this.id !== otherUser.id) {
				const weight = await this.update_similarity(otherUser);
				if (weight > 0.5) similar_user.push(otherUser);
			}
		}

		let tot = 0;
		for (const otherUser of nearbyUsers) {
			if (this.id !== otherUser.id) {
				const weight = await this.update_relation(
					otherUser,
					similar_user
				);
				tot += weight;
			}
		}

		this.fame_rate = tot / nearbyUsers.length;
	}

	async update_similarity(otherUser: User): Promise<number> {
		const weight = similarityScore(this, otherUser, [], []);
		await createMatchRelation(
			this.id,
			otherUser.id,
			weight,
			similarity_graph
		);
		return weight;
	}

	async update_relation(otherUser: User, similar_user: User[]) {
		const userA_tags = await Tags_Users.get_tags(this.id);
		const userB_tags = await Tags_Users.get_tags(otherUser.id);
		const weight = await matchingScore(
			this,
			otherUser,
			userA_tags,
			userB_tags,
			{
				profileViewTimeAtoB: 0,
				profileViewTimeBtoA: 0,
				timeToLikeAtoB: 0,
				timeToLikeBtoA: 0,
				hasLikedEachOther: false,
			},
			similar_user
		);
		await createMatchRelation(
			this.id,
			otherUser.id,
			weight,
			relation_graph
		);
		return weight;
	}

	async get_best_matches(): Promise<User[]> {
		const ids: number[] = await getTopWeightedMatches(
			this.id,
			relation_graph,
			100
		);
		const users = await User.get_all_by_ids(ids);
		return users;
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
			lat: this.lat,
			long: this.long,
			auth_provider: this.auth_provider,
			birthdate: this.birthdate,
			mbti: this.mbti,
			fame_rate: this.fame_rate,
		};
		return user;
	}

	async serialize_me(): Promise<UserType> {
		const user: UserType = await this.serialize();
		user.email = this.email;
		return user;
	}
}
