import { Image } from './image.ts';
import { User } from './user.ts';

export type Post = {
	user: User;
	posts: Image[];
	compatibility: number;
};

