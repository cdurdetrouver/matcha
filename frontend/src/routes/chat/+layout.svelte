<script lang="ts">
	import { AppShell, Avatar } from '@skeletonlabs/skeleton';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import type { Chat } from '$lib/types/chat.ts';

	export let data;

	const chats: Chat[] = data.chats;

	function getInitials(channelName: string): string {
		const serverSplit = channelName.split(' ');

		if (serverSplit.length > 1) {
			return serverSplit[0][0] + serverSplit[1][0];
		} else if (serverSplit.length === 1) {
			return serverSplit[0][0];
		}
		return '';
	}
</script>

<AppShell
	slotSidebarLeft="bg-surface-500/5 w-[22vw] h-[92vh] p-4 overflow-y-auto hidden lg:flex flex-col shadow-2xl"
>
	<svelte:fragment slot="sidebarLeft">
		<header class="border-b border-surface-500/30 h-fit p-4">
			<input class="input pl-2" type="search" placeholder="Search..." />
		</header>
		<div class="flex flex-col items-center justify-start w-full overflow-y-scroll overflow-x-hidden">
			{#each chats as chat}
				<button
					type="button"
					class="btn w-[20vw] flex items-center justify-start gap-2.5 mt-[10px] {chat.id === data.chatid
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
								{chat.LastMessage?.author.id === data.user.id
									? 'Moi'
									: chat.LastMessage?.author.username} : {chat.LastMessage?.message}
							{:else}
								No Message
							{/if}
						</p>
					</span>
				</button>
			{/each}
		</div>
	</svelte:fragment>
	<slot />
</AppShell>
