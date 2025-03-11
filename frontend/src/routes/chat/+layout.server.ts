import type { Chat } from '$lib/types/chat.ts';

export const load = async ({}) => {
	let chats: Chat[] = [
		{
			id:1,
			name:"les potos",
			users: [{id:1, username : "cdurdetrouver", created_at: Date.now(), avatar: "user.jpeg"}],
			LastMessage: {
				id: 1,
				message: 'Salut les potos! ca gaz ? de ouf',
				author: {id:1, username : "cdurdetrouver",created_at: Date.now(), avatar: "user.jpeg"},
				created_at: Date.now()
			},
			avatar: "user.jpeg"
		},
		{
			id:2,
			name:"les potos 2",
			users: [{id:1, username : "cdurdetrouver", created_at: Date.now(), avatar: "user.jpeg"}],
			avatar: 'blast.jpg'
		}
	];

	return {
		chats:chats
	};
};
