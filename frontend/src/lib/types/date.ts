import type { User } from './user';

export type Date = {
	id: number;
	user_to_meet: User;
	date: number;
	accepted: boolean;
	description: string;
};
