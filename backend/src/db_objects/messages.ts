import { client } from '../main.ts';
import { MessageType } from '../types/message.ts';
import { User } from './user.ts';

const TABLE = 'messages';

export class Message {
	content: string;
	user_id?: number;
	chat_id: number;
	type: string;
	id: number = 0;
	send_at: number = Date.now();

	[key: string]: unknown;
	constructor(
		contentOrOther: string | Partial<Message>,
		chat_id?: number,
		type?: string,
		user_id?: number
	) {
		if (typeof contentOrOther === 'object' && contentOrOther !== null) {
			this.content = contentOrOther.content!;
			this.user_id = contentOrOther.user_id;
			this.chat_id = contentOrOther.chat_id!;
			this.type = contentOrOther.type!;
			this.id = contentOrOther.id ?? 0;
			this.send_at = contentOrOther.send_at ?? Date.now();
		} else {
			this.content = contentOrOther;
			this.chat_id = chat_id!;
			this.type = type!;
			this.user_id = user_id;
			this.id = 0;
			this.send_at = Date.now();
		}
	}

	async save() {
		await client.queryObject(
			`
				UPDATE "${TABLE}"
				SET
					content = $1,
					user_id = $2,
					chat_id = $3,
					type = $4,
				WHERE id = $6;
			`,
			[this.content, this.user_id, this.chat_id, this.type, this.id]
		);
	}

	static async init_table() {
		await client.queryObject(`
			CREATE TABLE IF NOT EXISTS "${TABLE}" (
				id SERIAL PRIMARY KEY,
				content TEXT,
				user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
				chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
				type VARCHAR(255) NOT NULL,
				send_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
			);
		`);
	}

	async create() {
		const res = await client.queryObject<{ id: number }>(
			`
				INSERT INTO "${TABLE}" (content, user_id, chat_id, type)
				VALUES ($1, $2, $3, $4)
				RETURNING id
			`,
			[this.content, this.user_id, this.chat_id, this.type]
		);
		const message = res.rows[0];
		if (message == undefined)
			throw Error();
		this.id = message.id;
	}

	static async delete(id: number) {
		await client.queryObject(
			`
				DELETE FROM "${TABLE}" WHERE id = $1;
			`,
			[id]
		);
	}

	static async get_by_id(id: number): Promise<Message> {
		const res = await client.queryObject<Message>(
			`
				SELECT * FROM "${TABLE}" WHERE id = $1;
			`,
			[id]
		);
		const message = res.rows[0];
		if (message == undefined)
			throw Error();
		return new Message(message);
	}

	static async get_all_by_chat_id(chat_id: number): Promise<Message[]> {
		const res = await client.queryObject<Message>(
			`
				SELECT * FROM "${TABLE}" WHERE chat_id = $1;
			`,
			[chat_id]
		);
		return res.rows.map((row) => new Message(row));
	}

	static async get_last_message(chat_id: number): Promise<Message> {
		const res = await client.queryObject<Message>(
			`
				SELECT * FROM "${TABLE}" WHERE send_at = 
				(SELECT MAX(send_at) FROM ${TABLE}) AND chat_id = $1;
			`,
			[chat_id]
		);
		const message = res.rows[0];
		if (message == undefined)
			throw Error();
		return new Message(message);
	}

	static async get_10_mess_by_id(
		message_id: number, after_id: boolean, chat_id:number): Promise<Message[]> {
		const c = after_id ? '>' : '<';
		const res = await client.queryObject<Message>(
			`
				SELECT * FROM "${TABLE}" WHERE id ${c} '${message_id}'
				 AND chat_id = ${chat_id} limit 10;
			`,
		);
		return res.rows.map((row) => new Message(row));
	}

	async serialize(): Promise<MessageType> {
		let user;
		if (this.user_id)
			user = (await User.get_by_id(this.user_id)).serialize();

		const message: MessageType = {
			content: this.content,
			author: user,
			type: this.type,
			id: this.id,
			send_at: this.send_at,
		};
		return message;
	}
}
