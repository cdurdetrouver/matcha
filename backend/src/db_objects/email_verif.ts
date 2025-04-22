import { client } from '../main.ts';

const TABLE = 'email_verif';

export class Email_Verif {
	static async init_table() {
		await client.queryObject(`
			CREATE TABLE IF NOT EXISTS "${TABLE}" (
				user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
				token VARCHAR(255) NOT NULL,
				expiration TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '3 hour')
			);
		`);
	}

	static async create_token(user_id: number) {
		const token = crypto.randomUUID();
		await client.queryObject(
			`
				INSERT INTO "${TABLE}" (user_id, token) 
				VALUES ($1, $2)
			`,
			[user_id, token]
		);
		return token;
	}

	static async get_by_user_id(
		user_id: number
	): Promise<{ expiration: number; token: string }> {
		const res = await client.queryObject<{
			expiration: number;
			token: string;
		}>(
			`
				SELECT * FROM "${TABLE}"
				WHERE user_id = $1;
			`,
			[user_id]
		);
		return { expiration: res.rows[0].expiration, token: res.rows[0].token };
	}

	static async delete_by_user_id(user_id: number) {
		await client.queryObject(
			`
				DELETE FROM "${TABLE}"
				WHERE user_id = $1;
			`,
			[user_id]
		);
	}
}
