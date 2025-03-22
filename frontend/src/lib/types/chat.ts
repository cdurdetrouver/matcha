import type { User } from "./user";

export type Message = {
	id: number;
	message?: string;
	image?:string;
	video?:string;
	author: User;
	created_at: number;
	type:string;
}

export type Chat = {
	id:number;
	name:string;
	users: User[];
	LastMessage?: Message;
	avatar?: string;
}
