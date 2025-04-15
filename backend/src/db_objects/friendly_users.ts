import { client } from '../main.ts';

const TABLE = 'friendly_users';

export class Friendly_Users {
	static async init_table() {
		await client.queryObject(`
			CREATE TABLE IF NOT EXISTS "${TABLE}" (
				user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
				friendly_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
				PRIMARY KEY (user_id, friendly_id)
			);
		`);
	}

	static async make_a_friend(user_id: number, friendly_id: number) {
		await client.queryObject(
			`
				INSERT INTO "${TABLE}" (user_id, friendly_id) 
				VALUES ($1, $2)
			`,
			[user_id, friendly_id]
		);
	}

	static async is_my_friend(user_id: number, friendly_id:number): Promise<boolean> {
		const res = await client.queryObject<{ friendly_id: number, user_id: number }>(
			`
				SELECT friendly_id, user_id FROM "${TABLE}"
				WHERE user_id = $1 AND friendly_id = $2;
			`,
			[user_id, friendly_id]
		);
		if (res.rows[0] == undefined)
			return false;
		return true;
	}

	static async delete_friend(friendly_id: number, user_id: number) {
		await client.queryObject(
			`
				DELETE FROM "${TABLE}"
				WHERE friendly_id = $1 AND user_id = $2;
			`,
			[friendly_id, user_id]
		);
	}
}
