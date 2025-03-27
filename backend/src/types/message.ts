// import { db_get_user_custom } from "../utils/db_user.ts";
// import { UserType } from "./user.ts";

// export type MessageType = {
// 	id: number;
// 	message?: string;
// 	image?:string;
// 	video?:string;
// 	author?: UserType;
// 	created_at: number;
// 	type:string;
// }

// export class Message {
// 	content: string;
// 	author_id: number;
// 	message_type: string;
// 	id: number = 0;
// 	send_at: number = Date.now();

// 	[key: string]: unknown;
// 	constructor(...args: unknown[]) {
// 		this.content = args[0] as string;
// 		this.author_id = args[1] as number;
// 		this.message_type = args[2] as string;
// 		this.id = (args[3] as number) ?? 0;
// 		this.send_at = (args[4] as number) ?? Date.now();
// 	}
// 	async serialize(): Promise<MessageType> {
// 		const message:MessageType = {
// 			created_at: this.send_at,
// 			type: this.message_type,
// 			id: this.id
// 		}

// 		let ret_user = null;
// 		if (this.message_type != "announce") {
// 			ret_user = await db_get_user_custom("id", this.author_id.toString());
// 			if (ret_user != null)
// 				message.author = ret_user.serialize(); 
// 		}

// 		return (message);
// 	}

// 	static getPropertyNames(): string[] {
// 		return ["content", "author_id", "message_type", "id", "send_at"];
// 	}
// }