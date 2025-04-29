import { client } from '../main.ts';
import { ImageType } from '../types/image.ts';
import { get_signed_url } from '../utils/google_file.ts';

const TABLE = 'Image';

export class Image {
	filename: string;
	id: number = 0;
	user_id: number = 0;
	chat_id: number = 0;
	type?: string;

	constructor(
		idOrOther: string | Partial<Image>,
		filename?: string,
		object_id?: number,
		type?: string
	) {
		if (typeof idOrOther === 'object' && idOrOther !== null) {
			this.id = idOrOther.id ?? 0;
			this.filename = idOrOther.filename!;
			this.user_id = idOrOther.user_id!;
			this.chat_id = idOrOther.user_id!;
			this.type = idOrOther.type!;
		} else {
			if (type === 'chat')
				this.chat_id = object_id!;
			else
				this.user_id = object_id!;
			this.filename = filename!;
			this.id = Number(idOrOther)!;
		}
	}

	static async init_table() {
		await client.queryObject(`
			CREATE TABLE IF NOT EXISTS "${TABLE}" (
				id SERIAL PRIMARY KEY,
				user_id INT REFERENCES Users(id) ON DELETE CASCADE,
				chat_id INT REFERENCES Chats(id) ON DELETE CASCADE,
				filename VARCHAR(255),
				type VARCHAR(255)
			);

			CREATE UNIQUE INDEX IF NOT EXISTS unique_filename_non_default
			ON "${TABLE}"(filename)
			WHERE filename NOT LIKE 'avatar_%_default';
		`);
	}

	static async post(
		object_id: number,
		filename: string,
		type: string
	): Promise<Image> {
		let field = 'user_id';
		if (type === 'chat')
			field = 'chat_id';
		const res = await client.queryObject<{ id: number }>(
			`
				INSERT INTO "${TABLE}" (${field}, filename, type)
				VALUES ($1, $2, $3) RETURNING id;
			`,
			[object_id, filename, type]
		);
		const id = res.rows[0].id;
		return new Image({ id, filename, type });
	}

	static async get_post_by_user(user_id: number): Promise<Image[]> {
		const res = await client.queryObject<string>(
			`
				SELECT * FROM "${TABLE}"
				WHERE user_id = $1 AND type = 'post';
			`,
			[user_id]
		);
		return res.rows.map((row) => new Image(row));
	}

	static async get_avatar_by_user(user_id: number): Promise<Image> {
		const res = await client.queryObject<string>(
			`
				SELECT * FROM "${TABLE}"
				WHERE user_id = $1 AND type = 'avatar';
			`,
			[user_id]
		);
		const user = res.rows[0];
		if (user == undefined) throw Error('User avatar not found');
		return new Image(user);
	}

	static async get_avatar_by_chat(chat_id: number): Promise<Image> {
		const res = await client.queryObject<string>(
			`
				SELECT * FROM "${TABLE}"
				WHERE chat_id = $1 AND type = 'chat';
			`,
			[chat_id]
		);
		const chat = res.rows[0];
		if (chat == undefined) throw Error('Chat avatar not found');
		return new Image(chat);
	}

	static async get_by_id(id: number): Promise<Image> {
		const res = await client.queryObject<string>(
			`
				SELECT * FROM "${TABLE}"
				WHERE id = $1;
			`,
			[id]
		);
		const user = res.rows[0];
		if (user == undefined) throw Error();
		return new Image(user);
	}

	static async delete_by_id(image_id: number) {
		await client.queryObject(
			`
				DELETE FROM "${TABLE}"
				WHERE id = $1;
			`,
			[image_id]
		);
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

	async serialize(): Promise<ImageType> {
		const link = await get_signed_url(this.filename, 86400);
		let user_id, chat_id;
		if (this.type === 'chat') {
			user_id = undefined;
			chat_id = this.chat_id;
		}
		else {
			user_id = this .user_id;
			chat_id = undefined;
		}
		return {
			link: link,
			filename: this.filename,
			user_id: user_id,
			chat_id: chat_id,
			id: this.id,
		};
	}
}
