import { client } from '../main.ts';

const TABLE = 'block_users';

export class Block_Users {
	static async init_table() {
		await client.queryObject(`
			CREATE TABLE IF NOT EXISTS "${TABLE}" (
				blocker_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
				blocked_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
				PRIMARY KEY (blocker_id, blocked_id)
			);
		`);
	}

	static async block_user(blocker_id: number, blocked_id: number) {
		await client.queryObject(
			`
				INSERT INTO "${TABLE}" (blocker_id, blocked_id) 
				VALUES ($1, $2)
			`,
			[blocker_id, blocked_id]
		);
	}

	static async is_user_blocked_by(
		blocker_id: number,
		blocked_id: number
	): Promise<boolean> {
		const res = await client.queryObject<{
			blocked_id: number;
			blocker_id: number;
		}>(
			`
				SELECT blocked_id, blocker_id FROM "${TABLE}"
				WHERE blocker_id = $1 AND blocked_id = $2;
			`,
			[blocker_id, blocked_id]
		);
		if (res.rows[0] == undefined) return false;
		return true;
	}

	static async delete_block(blocked_id: number, blocker_id: number) {
		await client.queryObject(
			`
				DELETE FROM "${TABLE}"
				WHERE blocked_id = $1 AND blocker_id = $2;
			`,
			[blocked_id, blocker_id]
		);
	}
}
