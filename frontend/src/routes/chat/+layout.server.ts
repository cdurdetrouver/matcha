import type { Chat } from '$lib/types/chat.ts';

export const load = async ({}) => {
	let chats: Chat[] = [
		{
			id:1,
			name:"les potos",
			users: [{id:1, username : "cdurdetrouver", created_at: new Date(), avatar: "user.jpeg"}],
			LastMessage: {
				id: 1,
				message: 'Salut les potos ! Comment ça va ?',
				author: {id:1, username : "cdurdetrouver", created_at: new Date(), avatar: "user.jpeg"}
			},
			avatar: "user.jpeg"
		},
		{
			id:1,
			name:"les potos 2",
			users: [{id:1, username : "cdurdetrouver", created_at: new Date(), avatar: "user.jpeg"}],
		}
	];

	return {
		chats:chats
	};
};
