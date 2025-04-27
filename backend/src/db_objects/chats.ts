import type { ChatType } from '../types/chat.ts';
import { Chats_Users } from './chats_users.ts';
import { client } from '../main.ts';
import { User } from './user.ts';
import { Message } from './messages.ts';
import type { MessageType } from '../types/message.ts';
import { Image } from './images.ts';

const TABLE = 'chats';

export class Chat {
	name?: string;
	avatar?: string;
	id: number = 0;
	created_at: bigint = BigInt(Date.now());

	[key: string]: unknown;
	constructor(nameOrOther?: string | Partial<Chat>, avatar?: string) {
		if (typeof nameOrOther === 'object' && nameOrOther !== null) {
			this.name = nameOrOther.name;
			this.avatar = nameOrOther.avatar;
			this.id = nameOrOther.id ?? 0;
			this.created_at = nameOrOther.created_at ?? BigInt(Date.now());
		} else {
			this.name = nameOrOther;
			this.avatar = avatar;
		}
	}

	async save() {
		await client.queryObject(
			`
				UPDATE "${TABLE}"
				SET
					name = $1,
					avatar = $2,
				WHERE id = $3;
			`,
			[this.name, this.avatar, this.id]
		);
	}

	static async init_table() {
		await client.queryObject(`
			CREATE TABLE IF NOT EXISTS chats (
				id SERIAL PRIMARY KEY,
				name VARCHAR(255) DEFAULT NULL,
				avatar VARCHAR(255) DEFAULT NULL,
				created_at BIGINT DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000
			);
		`);
	}

	async create() {
		const res = await client.queryObject<{ id: number }>(
			`
				INSERT INTO "${TABLE}" (name, avatar) 
				VALUES ($1, $2)
				RETURNING id
			`,
			[this.name, this.avatar]
		);
		const chat = res.rows[0];
		if (chat == undefined) throw Error();
		this.id = chat.id;
	}

	static async delete(id: number) {
		await client.queryObject(
			`
				DELETE FROM "${TABLE}" WHERE id = $1;
			`,
			[id]
		);
	}

	static async get_by_id(id: number): Promise<Chat> {
		const res = await client.queryObject<Chat>(
			`
				SELECT * FROM "${TABLE}" WHERE id = $1;
			`,
			[id]
		);
		const chat = res.rows[0];
		if (chat == undefined) throw Error();
		return new Chat(chat);
	}

	static async get_all_by_ids(ids: number[]): Promise<Chat[]> {
		const res = await client.queryObject<Chat>(
			`
				SELECT * FROM "${TABLE}" WHERE id = ANY($1);
			`,
			[ids]
		);
		return res.rows.map((row) => new Chat(row));
	}

	static async get_by_field(
		field_name: string,
		field_value: string
	): Promise<Chat> {
		const res = await client.queryObject<Chat>(
			`
				SELECT * FROM "${TABLE}" WHERE ${field_name} = $1;
			`,
			[field_value]
		);
		const chat = res.rows[0];
		if (chat == undefined) throw Error();
		return chat;
	}

	async serialize(): Promise<ChatType> {
		const users_id = await Chats_Users.get_users_by_chat(this.id);
		const users = await User.get_all_by_ids(users_id);
		const users_serialize = await Promise.all(
			users.map(async (user) => await user.serialize())
		);
		let last_message: MessageType | undefined = undefined;
		let avatar;
		try {
			avatar = await (
				await await Image.get_avatar_by_user(this.id)
			).serialize();
			last_message = await (
				await Message.get_last_message(this.id)
			).serialize();
		} catch (_e) {
			avatar = undefined;
		}
		const chat: ChatType = {
			name: this.name,
			id: this.id,
			users: users_serialize,
			created_at: Number(this.created_at),
			avatar: avatar,
			LastMessage: last_message,
		};
		return chat;
	}
}
