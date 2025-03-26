import {UserType, User} from "./user.ts";
import {type MessageType} from "./message.ts";
import { db_get_message_custom } from "../utils/db_message.ts";
import { db_get_user_custom } from "../utils/db_user.ts";

export type ChatType = {
	id:number;
	name:string;
	users: UserType[];
	LastMessage?: MessageType;
	avatar?: string;
}

export class Chat {
	name: string;
	participants_ids: number[];
	messages_ids: number[];
	photo_id: string;
	id: number;
	created_at: number;

	[key: string]: unknown;
	constructor(...args: unknown[]) {
		this.name = args[0] as string;
		this.participants_ids = args[1] as number[];
		this.messages_ids = args[2] as number[];
		this.photo_id = args[3] as string;
		this.id = (args[4] as number) ?? 0;
		this.created_at = (args[5] as number) ?? Date.now();
	}

	async serialize(): Promise<ChatType> {
		const chat:ChatType = {
			id: this.id,
			name: this.name,
			users: [],
			avatar: this.photo_id
		}

		for (let i = 0; i < this.participants_ids.length; i++) {
			const ret_user: User | null = await db_get_user_custom("id", this.participants_ids[i].toString());
			if (ret_user != undefined)
				chat.users.push(ret_user.serialize()); 
		}

		if (this.messages_ids.length > 0) {
			const ret_mess = await db_get_message_custom("id", this.messages_ids[this.messages_ids.length - 1].toString());
			if (ret_mess != undefined)
				chat.LastMessage = await ret_mess.serialize(); 
		}
		return chat;
	}

	static getPropertyNames(): string[] {
		return ["name", "participants_ids", "messages_ids", "photo_id", "id", "created_at"];
	}
}

