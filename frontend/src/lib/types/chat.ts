import type { User } from './user';
import type { Image } from './image';

export type Message = {
	id: number;
	content?: string;
	image?: string;
	video?: string;
	author?: User;
	created_at: number;
	type: string;
};

export type Chat = {
	id: number;
	name?: string;
	users: User[];
	LastMessage?: Message;
	avatar?: Image;
	created_at?: number;
};
