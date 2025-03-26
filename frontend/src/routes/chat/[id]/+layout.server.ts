import type { Chat } from "$lib/types/chat";
import {redirect} from '@sveltejs/kit';
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent, params }: {parent: any, params:any}) => {
	const { chats } = await parent();
	const { id } = params;

	const chatId = parseInt(id, 10);
	const chat:Chat = chats.find((chat: Chat) => chat.id === chatId);
	if (!chat)
		throw redirect(302, '/chat');
	
	return {
		chat: chat,
	};
};
