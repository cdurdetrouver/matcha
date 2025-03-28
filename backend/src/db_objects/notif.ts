import { client } from '../main.ts';
import { NotifType } from '../types/notifs.ts';

const TABLE = 'notifs';

export class Notif {
	content: string;
	user_id: number;
	redirect: string;
	read: boolean = false;
	id: number = 0;
	send_at: number = Date.now();

	[key: string]: unknown;
	constructor(
		contentOrOther: string | Partial<Notif>,
		user_id?: number,
		redirect?: string
	) {
		if (typeof contentOrOther === 'object' && contentOrOther !== null) {
			this.content = contentOrOther.content!;
			this.user_id = contentOrOther.user_id!;
			this.redirect = contentOrOther.redirect!;
			this.read = contentOrOther.read ?? false;
			this.id = contentOrOther.id ?? 0;
			this.send_at = contentOrOther.send_at ?? Date.now();
		} else {
			console.log('notif');
			this.content = contentOrOther;
			this.user_id = user_id!;
			this.redirect = redirect!;
		}
	}

	async save() {
		await client.queryObject(
			`
				UPDATE "${TABLE}"
				SET
					content = $1,
					user_id = $2,
					redirect = $3,
					read = $4,
				WHERE id = $5;
			`,
			[this.content, this.user_id, this.redirect, this.id]
		);
	}

	static async init_table() {
		await client.queryObject(`
			CREATE TABLE IF NOT EXISTS "${TABLE}" (
				id SERIAL PRIMARY KEY,
				user_id INT NOT NULL,
				content TEXT NOT NULL,
				redirect VARCHAR(255) DEFAULT NULL,
				send_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				read BOOLEAN DEFAULT FALSE,
				FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
			);
		`);
	}

	async create() {
		const res = await client.queryObject<{ id: number }>(
			`
				INSERT INTO "${TABLE}" (content, user_id, redirect)
				VALUES ($1, $2, $3)
				RETURNING id
			`,
			[this.content, this.user_id, this.redirect]
		);
		this.id = res.rows[0].id;
	}

	static async delete(id: number) {
		await client.queryObject(
			`
				DELETE FROM "${TABLE}" WHERE id = $1;
			`,
			[id]
		);
	}

	static async get_by_id(id: number): Promise<Notif> {
		const res = await client.queryObject<Notif>(
			`
				SELECT * FROM "${TABLE}" WHERE id = $1;
			`,
			[id]
		);
		const notif = res.rows[0];
		return new Notif(notif);
	}

	static async get_all_by_user_id(user_id: number): Promise<Notif[]> {
		const res = await client.queryObject<Notif>(
			`
				SELECT * FROM "${TABLE}" WHERE user_id = $1;
			`,
			[user_id]
		);
		return res.rows.map((row) => new Notif(row));
	}

	serialize(): NotifType {
		const notif: NotifType = {
			content: this.content,
			redirect: this.redirect,
			read: this.read,
			id: this.id,
			send_at: this.send_at,
		};
		return notif;
	}
}
