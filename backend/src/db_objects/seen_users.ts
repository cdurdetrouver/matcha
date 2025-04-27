import { client } from '../main.ts';

const TABLE = 'seen_users';

export class Seen_Users {
	static async init_table() {
		await client.queryObject(`
			CREATE TABLE IF NOT EXISTS "${TABLE}" (
				user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
				seen_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
				PRIMARY KEY (user_id, seen_id)
			);
		`);
	}

	static async see_user(user_id: number, seen_id: number) {
		await client.queryObject(
			`
				INSERT INTO "${TABLE}" (user_id, seen_id) 
				VALUES ($1, $2)
			`,
			[user_id, seen_id]
		);
	}

	static async is_user_seen_by(
		user_id: number,
		seen_id: number
	): Promise<boolean> {
		const res = await client.queryObject<{
			seen_id: number;
			user_id: number;
		}>(
			`
				SELECT seen_id, user_id FROM "${TABLE}"
				WHERE user_id = $1 AND seen_id = $2;
			`,
			[user_id, seen_id]
		);
		if (res.rows[0] == undefined) return false;
		return true;
	}

	static async delete_saw(seen_id: number, user_id: number) {
		await client.queryObject(
			`
				DELETE FROM "${TABLE}"
				WHERE seen_id = $1 AND user_id = $2;
			`,
			[seen_id, user_id]
		);
	}
}
