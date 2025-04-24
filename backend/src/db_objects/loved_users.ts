import { client } from '../main.ts';

const TABLE = 'loves_users';

export class Loved_Users {
	static async init_table() {
		await client.queryObject(`
			CREATE TABLE IF NOT EXISTS "${TABLE}" (
				lover_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
				loved_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
				PRIMARY KEY (lover_id, loved_id)
			);
		`);
	}

	static async love_user(lover_id: number, loved_id: number) {
		await client.queryObject(
			`
				INSERT INTO "${TABLE}" (lover_id, loved_id) 
				VALUES ($1, $2)
			`,
			[lover_id, loved_id]
		);
	}

	static async is_user_loved_by(lover_id: number, loved_id:number): Promise<boolean> {
		const res = await client.queryObject<{ loved_id: number, lover_id: number }>(
			`
				SELECT loved_id, lover_id FROM "${TABLE}"
				WHERE lover_id = $1 AND loved_id = $2;
			`,
			[lover_id, loved_id]
		);
		if (res.rows[0] == undefined)
			return false;
		return true;
	}

	static async delete_love(loved_id: number, lover_id: number) {
		await client.queryObject(
			`
				DELETE FROM "${TABLE}"
				WHERE loved_id = $1 AND lover_id = $2;
			`,
			[loved_id, lover_id]
		);
	}
}
