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

	let chatContainer: HTMLElement | null = null;
	let chat: ChatType | undefined;
	let messages: Message[] = [];
	let currentMessage = '';
	let socket: WebSocketManager;

	onMount(async () => {
		chat = chats.find((chat) => chat.id === data.chatid);
		socket = new WebSocketManager(`/api/chat/${data.chatid}`);

		socket.setOnMessageHook(async (data) => {
			console.log(data);
			if (data.type === 'init') messages = data.messages;
			else if (data.type === 'message') messages = [...messages, data.message];
			else if (data.type === 'history') messages = [...data.messages, ...messages];

			await scrollToBottom();
		});

		await scrollToBottom();
	});

	async function sendMessage() {
		if (socket && currentMessage != '') socket.send(JSON.stringify(currentMessage));
		currentMessage = '';
	}

	async function scrollToBottom() {
		if (chatContainer) {
			console.log(chatContainer.scrollTop, chatContainer.scrollHeight);
			await tick(); // Wait for DOM updates
			chatContainer.scrollTop = chatContainer.scrollHeight;
			console.log(chatContainer.scrollTop, chatContainer.scrollHeight);
		}
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
	<section class="h-full overflow-scroll" bind:this={chatContainer}>
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
				class="resize-none bg-transparent border-0 p-2 ring-0 field-sizing-content"
				name="prompt"
				id="prompt"
				placeholder="Write a message..."
				rows="1"
			/>
			<button class="variant-filled-primary" type="submit">Send</button>
		</form>
	</div>
</main>
