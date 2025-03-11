<script lang="ts">
	import { AppShell, Avatar } from '@skeletonlabs/skeleton';
	import { page } from '$app/state';
	import type { Chat } from '$lib/types/chat.ts';

	export let data;

	const chats: Chat[] = data.chats;

	console.log(chats);

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

<AppShell slotSidebarLeft="bg-surface-500/5 w-[25vw] p-4 overflow-y-auto hidden lg:grid shadow-2xl">
	<svelte:fragment slot="sidebarLeft">
		<nav>
			<ul class="flex flex-col items-center gap-5 w-full">
				{#each chats as chat}
					<li class="w-[20vw] flex items-center gap-2.5">
						<a
							href="/chat/{chat.id}"
							class="hover:variant-soft-primary grid grid-cols-7 cursor-pointer group w-full"
						>
							<div class="col-span-2">
								<Avatar
									src={chat.avatar}
									alt="Chat {chat.id}"
									initials={getInitials(chat.name)}
									class="size-full group-hover:rounded-3xl group-hover:border-2"
									rounded={page.params.id === String(chat.id) ? 'rounded-3xl' : 'rounded-full'}
								/>
							</div>

							<div class="w-full col-span-5">
								<h3 class="h3">{chat.name}</h3>
								<p class="text-sm truncate">
									{#if chat.LastMessage}
										{chat.LastMessage?.author.id === data.user.id
											? 'Moi'
											: chat.LastMessage?.author.id} : {chat.LastMessage?.message}
									{:else}
										No Message
									{/if}
								</p>
							</div>
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</svelte:fragment>
	<slot />
</AppShell>
