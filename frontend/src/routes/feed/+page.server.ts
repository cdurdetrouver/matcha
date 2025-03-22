import type { Post } from '$lib/types/post';

export const load = async ({ locals, cookies }) => {
	const posts: Post[] = [
		{
			id: "2",
			title: "Delicious Homemade Pizza",
			content: "Made this pizza from scratch. So tasty!",
			author: "user456",
			createdAt: Date.now(),
			updatedAt: Date.now(),
			imageUrl: "https://example.com/pizza.jpg",
			likes: 200,
			comments: [
			{
				id: "c3",
				postId: "2",
				author: "user123",
				content: "Looks delicious!",
				createdAt: Date.now(),
				updatedAt: Date.now(),
			},
			{
				id: "c4",
				postId: "2",
				author: "user789",
				content: "Can I have the recipe?",
				createdAt: Date.now(),
				updatedAt: Date.now(),
			},
			],
			tags: ["pizza", "homemade", "food"],
		},{
			id: "1",
			title: "Beautiful Sunset",
			content: "Captured this stunning sunset at the beach today!",
			author: "user123",
			createdAt: Date.now(),
			updatedAt: Date.now(),
			imageUrl: "https://example.com/sunset.jpg",
			likes: 150,
			comments: [
			  {
				id: "c1",
				postId: "1",
				author: "user456",
				content: "Amazing shot!",
				createdAt: Date.now(),
				updatedAt: Date.now(),
			  },
			  {
				id: "c2",
				postId: "1",
				author: "user789",
				content: "Love the colors!",
				createdAt: Date.now(),
				updatedAt: Date.now(),
			  },
			],
			tags: ["sunset", "beach", "photography"],
		}
	];
	return {
		posts: posts,
	};
};
