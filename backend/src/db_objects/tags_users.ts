import { client } from '../main.ts';

const TABLE = 'tags_users';

export class Tags_Users {
	static async init_table() {
		await client.queryObject(`
			CREATE TABLE IF NOT EXISTS "${TABLE}" (
				user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
				tag TEXT REFERENCES tags(name) ON DELETE CASCADE
			);
		`);
	}

	static async add_tag(user_id: number, tag: string) {
		await client.queryObject(
			`
				INSERT INTO "${TABLE}" (tag, user_id)
				VALUES ($1, $2);
			`,
			[tag, user_id]
		);
	}

	static async had_tag(user_id: number, tag: string): Promise<boolean> {
		const res = await client.queryObject<{ tag: string }>(
			`
				SELECT tag FROM "${TABLE}"
				WHERE user_id = $1 AND tag = $2;
			`,
			[user_id, tag]
		);
		if (res.rows[0] == undefined) return false;
		return true;
	}

	static async get_tags(user_id: number): Promise<string[]> {
		const res = await client.queryObject<{ tag: string }>(
			`
				SELECT tag FROM "${TABLE}" WHERE user_id = $1;
			`,
			[user_id]
		);
		return res.rows.map((row) => row.tag);
	}

	static async delete_tag(user_id: number, tag: string) {
		await client.queryObject(
			`
				DELETE FROM "${TABLE}" WHERE user_id = $1 AND tag = $2;
			`,
			[user_id, tag]
		);
	}
}
