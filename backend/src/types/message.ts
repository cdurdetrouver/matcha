import { UserType } from './user.ts';

export type MessageType = {
	id: number;
	content?: string;
	call_content?: RTCSessionDescriptionInit;
	author?: UserType;
	send_at: number;
	type: string;
};