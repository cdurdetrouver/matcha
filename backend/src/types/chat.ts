import type { UserType } from './user.ts';
import type { MessageType } from './message.ts';
import { ImageType } from './image.ts';

export type ChatType = {
	id: number;
	name?: string;
	users: UserType[];
	LastMessage?: MessageType;
	avatar?: ImageType;
	created_at?: number;
};
