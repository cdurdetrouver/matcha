import { UserType } from './user.ts';

export type DateType = {
	id: number;
	user_to_meet: UserType;
	user: UserType;
	date: number;
	accepted: boolean;
	description: string;
};
	