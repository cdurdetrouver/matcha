export const load = async ({ params }) => {
	// let chats: Chat[] = [
	// 	{
	// 		id: 1,
	// 		name: 'les potos',
	// 		users: [
	// 			{
	// 				id: 1,
	// 				username: 'cdurdetrouver',
	// 				created_at: Date.now(),
	// 				avatar: '/user.jpeg',
	// 				completed: true
	// 			}
	// 		],
	// 		LastMessage: {
	// 			id: 1,
	// 			type: 'chat',
	// 			message: 'Hello, how are you ?',
	// 			author: {
	// 				id: 2,
	// 				username: 'blast',
	// 				created_at: Date.now(),
	// 				avatar: '/blast.jpg',
	// 				completed: true
	// 			},
	// 			created_at: Date.now()
	// 		},
	// 		avatar: '/user.jpeg'
	// 	},
	// 	{
	// 		id: 2,
	// 		name: 'Blast',
	// 		users: [
	// 			{
	// 				id: 1,
	// 				username: 'cdurdetrouver',
	// 				created_at: Date.now(),
	// 				avatar: '/user.jpeg',
	// 				completed: true
	// 			}
	// 		],
	// 		avatar: '/blast.jpg'
	// 	}
	// ];

	return {
		// chats: chats,
		chatid: Number(params.id)
	};
};
