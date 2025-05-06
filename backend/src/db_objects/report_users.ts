import { client } from '../main.ts';
import { User } from './user.ts';

const TABLE = 'report_users';

export class Report_Users {
	user_id: number;
	target_id: number;
	reason: string;

	constructor(
		user_idOrOther: number | Partial<Report_Users>,
		target_id?: number,
		reason?: string
	) {
		if (typeof user_idOrOther === 'object' && user_idOrOther !== null) {
			this.user_id = user_idOrOther.user_id!;
			this.target_id = user_idOrOther.target_id!;
			this.reason = user_idOrOther.reason!;
		} else {
			this.user_id = user_idOrOther;
			this.target_id = target_id!;
			this.reason = reason!;
		}
	}

	static async init_table() {
		await client.queryObject(`
			CREATE TABLE IF NOT EXISTS "${TABLE}" (
				user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
				target_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
				reason VARCHAR(255) NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				PRIMARY KEY (user_id, target_id, reason)
			);
		`);
	}

	static async add_report(
		user_id: number,
		target_id: number,
		reason: string
	) {
		await client.queryObject(`
			INSERT INTO "${TABLE}" (user_id, target_id, reason)
			VALUES ($1, $2, $3)
			ON CONFLICT (user_id, target_id, reason)
			DO NOTHING;
		`, [user_id, target_id, reason]);
	}

	static async get_reports_by_target(target_id: number, reason: string): Promise<User[]> {
		const res = await client.queryObject<{
			user_id: number;
		}>(`
			SELECT user_id FROM "${TABLE}"
			WHERE target_id = $1 AND reason = $2;
		`, [target_id, reason]);
		return await Promise.all(res.rows.map(async (row) => 
			await User.get_by_id(row.user_id)));
	}
}