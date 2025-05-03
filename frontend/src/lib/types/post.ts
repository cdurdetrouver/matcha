import { type Image } from './image';
import { type User } from './user';

export type Post = {
	user: User;
	posts: Image[];
	compatibility: number;
};
