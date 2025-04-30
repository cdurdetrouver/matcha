<script lang="ts">
	import Chat from '$lib/components/chat/Chat.svelte';
	import Announce from '$lib/components/chat/Announce.svelte';
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	import type { Message, Chat as ChatType } from '$lib/types/chat.js';
	import { WebSocketManager } from '$lib/script/request.js';
	import { tick } from 'svelte';
	import { ChatsStore } from '$lib/stores/chats.js';

	export let data;
	let chats: ChatType[] = [];
	ChatsStore.subscribe((value) => chats.push(...value));

	let classes = {
		personal: [
			'flex flex-col items-end justify-start gap-2 lg:flex-row-reverse lg:justify-start lg:items-start',
			'card w-fit p-4 rounded-tr-none space-y-2 variant-soft-primary'
		],
		other: [
			'grid grid-rows-[auto_1fr] md:grid-cols-[auto_1fr] gap-2',
			'card w-fit p-4 rounded-tl-none space-y-2 variant-soft'
		]
	};

	let chatContainer: HTMLElement;
	let textarea: HTMLElement;
	let chat: ChatType | undefined;
	let messages: Message[] = [];
	let currentMessage = '';
	let socket: WebSocketManager;

	onMount(async () => {
		chat = chats.find((chat) => chat.id === data.chatid);
		socket = new WebSocketManager(`/api/chat/${data.chatid}`);

		socket.setOnMessageHook(async (data) => {
			if (data.type === 'init') messages = data.messages;
			else if (data.type === 'message') messages = [...messages, data.message];
			else if (data.type === 'history') messages = [...data.messages, ...messages];

			if (data.type !== 'history') await scrollToBottom();
		});

		await scrollToBottom();
	});

	async function sendMessage() {
		const newMessage: Message = {
			content: currentMessage,
			type: 'chat',
			id: 0,
			created_at: Date.now()
		};
		if (socket && currentMessage != '') socket.send(newMessage);
		currentMessage = '';
	}

	async function scrollToBottom() {
		await tick();
		chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
	}

	function handleScroll() {
		// const { scrollTop, scrollHeight, clientHeight } = chatContainer;
		// if (scrollHeight <= clientHeight || scrollTop <= scrollHeight / 2) {
		// 	if (messages.length > 0) {
		// 		console.log(messages[0].id);
		// 		socket.send({
		// 			type: 'history',
		// 			chat_id: messages[0].id
		// 		});
		// 	}
		// }
	}

	function onPromptKeydown(event: KeyboardEvent): void {
		if (event.code === 'Enter' && event.shiftKey) {
			event.preventDefault();
			currentMessage += '\n';
		} else if (event.code === 'Enter') {
			event.preventDefault();
			sendMessage();
			textarea.style.height = 'fit-content';
		}
	}

	function resizeTextarea() {
		textarea.style.height = 'fit-content';
		const maxHeight = 6 * parseFloat(getComputedStyle(textarea).lineHeight || '20');
		textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
	}
</script>

<main class="h-[92vh] flex flex-col">
	<header class="h-fit p-4 flex items-center justify-center relative">
		<a href="/chat" class="md:hidden absolute top-1/2 -translate-y-1/2 left-[10px]">
			<Icon icon="ic:round-arrow-back" width="24" height="24" />
		</a>
		{#if chat}
			<h2 class="h2">{chat.name}</h2>
		{/if}
	</header>
	<section class="h-full overflow-y-auto" bind:this={chatContainer} on:scroll={handleScroll}>
		<ul class="size-full p-10 flex flex-col gap-2.5">
			{#each messages as message}
				{#if message.type == 'announce'}
					<Announce {message} />
				{:else}
					<Chat
						{message}
						classes={classes[message.author?.id === data.user?.id ? 'personal' : 'other']}
					/>
				{/if}
			{/each}
		</ul>
	</section>
	<div class="h-fit p-4">
		<form
			class="input-group input-group-divider grid-cols-[auto_1fr_auto] rounded-container-token"
			on:submit|preventDefault={sendMessage}
		>
			<button class="input-group-shim">+</button>
			<textarea
				bind:value={currentMessage}
				class="bg-transparent border-0 ring-0 p-2 h-fit"
				name="prompt"
				id="prompt"
				placeholder="Write a message..."
				rows="1"
				on:keydown={onPromptKeydown}
				on:input={resizeTextarea}
				bind:this={textarea}
			/>
			<button class="variant-filled-primary" type="submit">Send</button>
		</form>
	</div>
</main>
