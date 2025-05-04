import type { User } from './user';

export type Date = {
	id: number;
	user_to_meet: User;
	user: User;
	date: number;
	accepted: boolean;
	description: string;
};
