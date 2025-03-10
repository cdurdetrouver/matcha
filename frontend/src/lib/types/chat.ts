import type { User } from "./user";

export type Message = {
	id: number;
	message: string;
	author: User;
}

export type Chat = {
	id:number;
	name:string;
	users: User[];
	LastMessage?: Message;
	avatar?: string;
}
