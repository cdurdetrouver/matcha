import { client } from '../main.ts';

const TABLE = 'ban_users';

export class Ban_Users {
	email: string;

	constructor(mail_ban: string) {
		this.email = mail_ban;
	}

	static async init_table() {
		await client.queryObject(`
			CREATE TABLE IF NOT EXISTS "${TABLE}" (
				email VARCHAR(255) PRIMARY KEY
			);
		`);
	}

	static async add_ban(email: string) {
		await client.queryObject(`
			INSERT INTO "${TABLE}" (email)
			VALUES ($1)
			ON CONFLICT (email)
			DO NOTHING;
		`, [email]);
	}

	static async is_banned(email: string): Promise<boolean> {
		const res = await client.queryObject<{
			email: string;
		}>(
			`
				SELECT email FROM "${TABLE}"
				WHERE email = $1;
			`,
			[email]
		);
		return res.rows.length > 0;
	}
}