import { UserType } from "./user.ts";

export type RelationType = {
	user_target: UserType;
	relation: number;
}