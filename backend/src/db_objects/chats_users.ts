import { client } from '../main.ts';

const TABLE = 'chats_users';

export class Chats_Users {
	static async init_table() {
		await client.queryObject(`
			CREATE TABLE IF NOT EXISTS "${TABLE}" (
				user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
				chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
				PRIMARY KEY (user_id, chat_id)
			);
		`);
	}

	static async getall(): Promise<number[]> {
		const res = await client.queryObject<number>(
			`
                    SELECT * FROM "${TABLE}";
                `
		);
		return res.rows.map((row) => row);
	}

	static async add_user_chat(user_id: number, chat_id: number) {
		await client.queryObject(
			`
				INSERT INTO "${TABLE}" (chat_id, user_id) 
				VALUES ($1, $2)
			`,
			[chat_id, user_id]
		);
	}

	static async get_users_by_chat(chat_id: number): Promise<number[]> {
		const res = await client.queryObject<{ user_id: number }>(
			`
				SELECT user_id FROM "${TABLE}"
				WHERE chat_id = $1;
			`,
			[chat_id]
		);
		return res.rows.map((row) => row.user_id);
	}

	static async get_chats_by_user(user_id: number): Promise<number[]> {
		const res = await client.queryObject<{ chat_id: number }>(
			`
				SELECT chat_id FROM "${TABLE}"
				WHERE user_id = $1;
			`,
			[user_id]
		);
		return res.rows.map((row) => row.chat_id);
	}

	static async get_chats_by_2_user(user_id1: number,
		user_id2: number): Promise<number[]> {
		const res = await client.queryObject<{ chat_id: number }>(
			`
				SELECT chat_id FROM "${TABLE}"
				WHERE user_id = $1 AND chat_id IN (
				SELECT chat_id FROM "${TABLE}"
				WHERE user_id = $2);
			`,
			[user_id1, user_id2]
		);
		return res.rows.map((row) => row.chat_id);
	}

	static async delete_user_chat(user_id: number, chat_id: number) {
		await client.queryObject(
			`
				DELETE FROM "${TABLE}"
				WHERE user_id = $1 AND chat_id = $2;
			`,
			[user_id, chat_id]
		);
	}

	static async get_mp(
		user1_id: number,
		user2_id: number
	): Promise<number | undefined> {
		const res = await client.queryObject<{ chat_id: number }>(
			`
				SELECT chat_id FROM "${TABLE}"
				WHERE user_id = $1 AND chat_id IN (
					SELECT chat_id FROM "${TABLE}"
					WHERE user_id = $2
				);
			`,
			[user1_id, user2_id]
		);
		if (res.rows.length == 0) return undefined;
		return res.rows[0].chat_id;
	}
}
