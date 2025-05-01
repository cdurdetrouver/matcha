import { UserType } from './user.ts';

export type RelationType = {
	user_target: UserType;
	relation: number;
	time_to_match: number;
};
