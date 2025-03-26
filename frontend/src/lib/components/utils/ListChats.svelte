<script lang="ts">

	import { Avatar } from '@skeletonlabs/skeleton';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import type { Chat } from '$lib/types/chat.ts';
	import type { User } from '$lib/types/user.ts';

	let search:string = "";

	export let chats:Chat[];
	export let user: User | null;
	export let chatid:number;

	function getInitials(channelName: string): string {
		const serverSplit = channelName.split(' ');

		if (serverSplit.length > 1) {
			return serverSplit[0][0] + serverSplit[1][0];
		} else if (serverSplit.length === 1) {
			return serverSplit[0][0];
		}
		return '';
	}

	function FilterChats(search: string, chats: Chat[]) {
		let newChats: Chat[] = [];

		const searchLower = search.toLowerCase();

		for (let i = 0; i < chats.length; i++) {
			if (chats[i].name.toLowerCase().includes(searchLower)) {
				newChats.push(chats[i]);
			}
		}

		return newChats;
	}
</script>


<header class="border-b border-surface-500/30 h-fit p-4">
	<input class="input pl-2" type="search" placeholder="Search..." bind:value={search} />
</header>
<div class="flex flex-col items-center justify-start w-full overflow-y-scroll overflow-x-hidden">
	{#each (search !== "" ? FilterChats(search, chats) : chats) as chat}
		<button
			type="button"
			class="btn w-full flex items-center justify-start gap-2.5 mt-[10px] {chat.id === chatid
				? 'variant-filled-primary'
				: 'bg-surface-hover-token'}"
			on:click={() => goto('/chat/' + chat.id)}
		>
			<Avatar
				src={chat.avatar}
				alt="Chat {chat.id}"
				initials={getInitials(chat.name)}
				class="min-w-10 max-w-10"
				rounded={page.params.id === String(chat.id) ? 'rounded-3xl' : 'rounded-full'}
			/>

			<span class="flex-1 w-[10vw] text-start">
				<h3 class="h5">{chat.name}</h3>
				<p class="text-sm truncate">
					{#if chat.LastMessage}
						{chat.LastMessage?.author?.id === user?.id
							? 'Moi'
							: chat.LastMessage?.author?.username} : {chat.LastMessage?.message}
					{:else}
						No Message
					{/if}
				</p>
			</span>
		</button>
	{/each}
</div>