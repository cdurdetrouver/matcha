import { client } from '../main.ts';
import { User } from "./user.ts";

const TABLE = 'seen_users';

export class Seen_Users {
	static async init_table() {
		await client.queryObject(`
            CREATE TABLE IF NOT EXISTS "${TABLE}" (
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                seen_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                time_ms BIGINT DEFAULT 0,
                PRIMARY KEY (user_id, seen_id)
            );
        `);
	}

	static async see_user(user_id: number, seen_id: number, time_ms: number) {
		await client.queryObject(
			`
                INSERT INTO "${TABLE}" (user_id, seen_id, time_ms) 
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id, seen_id)
                DO UPDATE SET time_ms = "${TABLE}".time_ms + $3;
            `,
			[user_id, seen_id, time_ms]
		);
	}

	static async is_user_seen_by(
		user_id: number,
		seen_id: number
	): Promise<number | undefined> {
		const res = await client.queryObject<{
			time_ms: number;
		}>(
			`
                SELECT time_ms FROM "${TABLE}"
                WHERE user_id = $1 AND seen_id = $2;
            `,
			[user_id, seen_id]
		);
		if (res.rows.length === 0) return undefined;
		return res.rows[0].time_ms;
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

	static async get_who_seen(user_id: number): Promise<User[]> {
		const res = await client.queryObject<{
			seen_id: number;
		}>(
			`
				SELECT seen_id FROM "${TABLE}"
				WHERE user_id = $1 AND time_ms > 14;
			`,
			[user_id]
		);
		return await Promise.all(res.rows.map(
			async (row) => await User.get_by_id(row.seen_id)));
	}
}
