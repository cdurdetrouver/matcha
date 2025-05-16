import { client } from '../main.ts';
import { MessageType } from '../types/message.ts';
import { User } from './user.ts';
import { filter } from '../utils/filter.ts';

const TABLE = 'messages';

export class Message {
	content: string;
	call_content?: RTCSessionDescriptionInit;
	user_id?: number;
	chat_id: number;
	type: string;
	id: number = 0;
	send_at: bigint = BigInt(Date.now());

	[key: string]: unknown;
	constructor(
		contentOrOther: string | Partial<Message>,
		chat_id?: number,
		type?: string,
		user_id?: number,
		call_content?: RTCSessionDescriptionInit
	) {
		if (typeof contentOrOther === 'object' && contentOrOther !== null) {
			this.content = contentOrOther.content!;
			this.call_content = contentOrOther.call_content!;
			this.user_id = contentOrOther.user_id;
			this.chat_id = contentOrOther.chat_id!;
			this.type = contentOrOther.type!;
			this.id = contentOrOther.id ?? 0;
			this.send_at = contentOrOther.send_at ?? BigInt(Date.now());
		} else {
			if (call_content != undefined) {
				this.call_content = call_content;
			}
			this.content = contentOrOther!;
			this.chat_id = chat_id!;
			this.type = type!;
			this.user_id = user_id;
		}
	}

	async save() {
		this.content = filter.clean(this.content);
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
				send_at BIGINT DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000
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
		if (message == undefined) throw Error();
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
		if (message == undefined) throw Error();
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
		if (message == undefined) throw Error();
		return new Message(message);
	}

	static async get_10_mess_by_id(chat_id: number): Promise<Message[]> {
		const res = await client.queryObject<Message>(
			`
				SELECT * FROM "${TABLE}"
				WHERE chat_id = $1
				ORDER BY id DESC
				LIMIT 10;
			`,
			[chat_id]
		);
		return res.rows.map((row) => new Message(row)).reverse();
	}

	async serialize(): Promise<MessageType> {
		let user;
		if (this.user_id)
			user = await (await User.get_by_id(this.user_id)).serialize();

		const message: MessageType = {
			content: this.content,
			call_content: this.call_content,
			author: user,
			type: this.type,
			id: this.id,
			send_at: Number(this.send_at),
		};
		return message;
	}
}
