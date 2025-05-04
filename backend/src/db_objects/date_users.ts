import { client } from '../main.ts';
import { DateType } from '../types/date.ts';
import { User } from './user.ts';

const TABLE = 'date_users';

export class Date_Users {
	id: number = 0;
	user_id: number = 0;
	user_to_meet_id: number = 0;
	description: string = '';
	date: bigint = BigInt(Date.now());
	accepted: boolean = false;

	constructor(
		user_id1OrOther: number | Partial<Date_Users>,
		user_to_meet_id?: number,
		description?: string,
		date?: bigint
	) {
		if (typeof user_id1OrOther === 'object' && user_id1OrOther !== null) {
			if (user_id1OrOther.user_id != undefined)
				this.user_id = user_id1OrOther.user_id;
			this.user_to_meet_id = user_id1OrOther.user_to_meet_id!;
			this.description = user_id1OrOther.description!;
			this.date = user_id1OrOther.date!;
			this.accepted = user_id1OrOther.accepted!;
			this.id = user_id1OrOther.id!;
		} else {
			this.user_id = user_id1OrOther;
			this.user_to_meet_id = user_to_meet_id!;
			this.description = description!;
			this.date = date!;
		}
	}

	static async init_table() {
		await client.queryObject(
			`
			CREATE EXTENSION IF NOT EXISTS postgis;

			CREATE TABLE IF NOT EXISTS "${TABLE}" (
				id SERIAL PRIMARY KEY,
				user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
				user_to_meet_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
				description TEXT DEFAULT NULL,
				date BIGINT DEFAULT NULL,
				accepted BOOLEAN DEFAULT FALSE
			);
			`
		);
	}

	async save() {
		await client.queryObject(
			`
				UPDATE "${TABLE}"
				SET
					description = $1,
					date = $2,
					accepted = $3
				WHERE id = $4;
			`,
			[this.description, this.date, this.accepted, this.id]
		);
	}

	async create() {
		const res = await client.queryObject<{ id: number }>(
			`
				INSERT INTO "${TABLE}" (user_id, user_to_meet_id, description, date)
				VALUES ($1, $2, $3, $4) RETURNING id;
			`,
			[this.user_id, this.user_to_meet_id, this.description, this.date]
		);
		if (res.rows.length > 0) this.id = res.rows[0].id;
	}

	static async get_by_id(id: number): Promise<Date_Users> {
		const res = await client.queryObject<{
			id: number;
			user_id: number;
			user_to_meet_id: number;
			date: bigint;
			accepted: boolean;
			description: string;
		}>(
			`
				SELECT
					id,
					user_id,
					user_to_meet_id,
					date,
					accepted,
					description
				FROM "${TABLE}"
				WHERE id = $1;
			`,
			[id]
		);
		if (res.rows.length === 0) {
			throw new Error('Date not found');
		}
		const row = res.rows[0];
		return new Date_Users(row);
	}

	static async get_user_dates(user_id: number): Promise<Date_Users[]> {
		const res = await client.queryObject<{
			user_to_meet_id: number;
			lat: number;
			long: number;
			date: bigint;
			id: number;
			accepted: boolean;
		}>(
			`
				SELECT
				user_id,
				user_to_meet_id,
				date,
				id,
				accepted,
				description
				FROM "${TABLE}"
				WHERE user_id = ${user_id} OR user_to_meet_id = ${user_id};
			`
		);
		return res.rows.map((row) => new Date_Users(row));
	}

	async serialize(): Promise<DateType> {
		const user_to_meet = await User.get_by_id(this.user_to_meet_id);
		const user = await User.get_by_id(this.user_id);
		const date: DateType = {
			id: this.id,
			user_to_meet: await user_to_meet.serialize(),
			user: await user.serialize(),
			date: Number(this.date),
			accepted: this.accepted,
			description: this.description,
		};
		return date;
	}

	async delete() {
		await client.queryObject(
			`
				DELETE FROM "${TABLE}" WHERE id = $1;
			`,
			[this.id]
		);
	}
}
