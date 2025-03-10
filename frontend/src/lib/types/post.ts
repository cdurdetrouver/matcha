export type Post = {
	id: string;
	title: string;
	content: string;
	author: string;
	createdAt: number;
	updatedAt: number;
	imageUrl: string;
	likes: number;
	comments: Comment[];
	tags: string[];
}

export type Comment = {
	id: string;
	postId: string;
	author: string;
	content: string;
	createdAt: number;
	updatedAt: number;
}
