import type { Chat } from '$lib/types/chat.ts';

export const load = async ({ params }) => {
	let chats: Chat[] = [
		{
			id:1,
			name:"les potos",
			users: [{id:1, username : "cdurdetrouver", created_at: Date.now(), avatar: "/user.jpeg"}],
			LastMessage: {
				id: 1,
				message: 'Hello, how are you ?',
				author: {id:2, username : "blast",created_at: Date.now(), avatar: "/blast.jpg"},
				created_at: Date.now()
			},
			avatar: "/user.jpeg"
		},
		{
			id:2,
			name:"les potos 2",
			users: [{id:1, username : "cdurdetrouver", created_at: Date.now(), avatar: "/user.jpeg"}],
			avatar: '/blast.jpg'
		},
		{
			id:2,
			name:"les potos 2",
			users: [{id:1, username : "cdurdetrouver", created_at: Date.now(), avatar: "/user.jpeg"}],
			avatar: '/blast.jpg'
		},
		{
			id:2,
			name:"les potos 2",
			users: [{id:1, username : "cdurdetrouver", created_at: Date.now(), avatar: "/user.jpeg"}],
			avatar: '/blast.jpg'
		},
		{
			id:2,
			name:"les potos 2",
			users: [{id:1, username : "cdurdetrouver", created_at: Date.now(), avatar: "/user.jpeg"}],
			avatar: '/blast.jpg'
		},
		{
			id:2,
			name:"les potos 2",
			users: [{id:1, username : "cdurdetrouver", created_at: Date.now(), avatar: "/user.jpeg"}],
			avatar: '/blast.jpg'
		},
		{
			id:2,
			name:"les potos 2",
			users: [{id:1, username : "cdurdetrouver", created_at: Date.now(), avatar: "/user.jpeg"}],
			avatar: '/blast.jpg'
		},
		{
			id:2,
			name:"les potos 2",
			users: [{id:1, username : "cdurdetrouver", created_at: Date.now(), avatar: "/user.jpeg"}],
			avatar: '/blast.jpg'
		},
		{
			id:2,
			name:"les potos 2",
			users: [{id:1, username : "cdurdetrouver", created_at: Date.now(), avatar: "/user.jpeg"}],
			avatar: '/blast.jpg'
		},
		{
			id:2,
			name:"les potos 2",
			users: [{id:1, username : "cdurdetrouver", created_at: Date.now(), avatar: "/user.jpeg"}],
			avatar: '/blast.jpg'
		},
		{
			id:2,
			name:"les potos 2",
			users: [{id:1, username : "cdurdetrouver", created_at: Date.now(), avatar: "/user.jpeg"}],
			avatar: '/blast.jpg'
		},
		{
			id:2,
			name:"les potos 2",
			users: [{id:1, username : "cdurdetrouver", created_at: Date.now(), avatar: "/user.jpeg"}],
			avatar: '/blast.jpg'
		},
		{
			id:2,
			name:"les potos 2",
			users: [{id:1, username : "cdurdetrouver", created_at: Date.now(), avatar: "/user.jpeg"}],
			avatar: '/blast.jpg'
		},
		{
			id:2,
			name:"les potos 2",
			users: [{id:1, username : "cdurdetrouver", created_at: Date.now(), avatar: "/user.jpeg"}],
			avatar: '/blast.jpg'
		},
		{
			id:2,
			name:"les potos 2",
			users: [{id:1, username : "cdurdetrouver", created_at: Date.now(), avatar: "/user.jpeg"}],
			avatar: '/blast.jpg'
		},
		{
			id:2,
			name:"les potos 2",
			users: [{id:1, username : "cdurdetrouver", created_at: Date.now(), avatar: "/user.jpeg"}],
			avatar: '/blast.jpg'
		},
		{
			id:2,
			name:"les potos 2",
			users: [{id:1, username : "cdurdetrouver", created_at: Date.now(), avatar: "/user.jpeg"}],
			avatar: '/blast.jpg'
		},
		{
			id:2,
			name:"les potos 2",
			users: [{id:1, username : "cdurdetrouver", created_at: Date.now(), avatar: "/user.jpeg"}],
			avatar: '/blast.jpg'
		}
	];

	return {
		chats:chats,
		chatid: Number(params.id)
	};
};
