import { UserType } from './user.ts';

export type MessageType = {
	id: number;
	content?: string;
	author?: UserType;
	send_at: number;
	type: string;
};
