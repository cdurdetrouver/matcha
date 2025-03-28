import type { UserType } from './user.ts';
import type { MessageType } from './message.ts';

export type ChatType = {
	id: number;
	name?: string;
	users: UserType[];
	LastMessage?: MessageType;
	avatar?: string;
	created_at?: number;
};
