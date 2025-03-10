<script lang="ts">
	import { AppShell, Avatar } from '@skeletonlabs/skeleton';
	import { page } from '$app/state';
	import type { Chat } from '$lib/types/chat.ts';

	export let data;

	const chats: Chat[] = data.chats;

	function getInitials(channelName: string): string {
		const serverSplit = channelName.split(' ');

		if (serverSplit.length > 1) {
			return serverSplit[0][0] + serverSplit[1][0]; // eg: IT
		} else if (serverSplit.length === 1) {
			return serverSplit[0][0]; // eg: I
		}
		return '';
	}
</script>

<!-- App Shell -->
<AppShell slotSidebarLeft="bg-surface-500/5 w-[25vw] p-4 overflow-y-auto hidden lg:grid shadow-2xl">
	<!-- Choose Server -->
	<svelte:fragment slot="sidebarLeft">
		<!-- list of server -->
		<nav>
			<ul class="flex flex-col items-center gap-5 w-full">
				{#each chats as chat}
					<li class="w-full flex items-center gap-2.5">
						<a
							href="/chat/{chat.id}"
							class="hover:variant-soft-primary flex items-center gap-2.5 cursor-pointer group w-full"
						>
							<Avatar
								src={chat.avatar}
								alt="Message {chat.id}"
								initials={getInitials(chat.name)}
								class="w-15 h-15 border-white {page.params.id === String(chat.id)
									? 'border-4'
									: 'group-hover:rounded-3xl group-hover:border-2 '}"
								rounded={page.params.id === String(chat.id) ? 'rounded-3xl' : 'rounded-full'}
							/>

							<div class="w-max overflow-hidden">
								<h3 class="h3">{chat.name}</h3>
								<p class="text-sm overflow-hidden text-overflow-ellipsis whitespace-nowrap">
									{chat.LastMessage?.author.username} : {chat.LastMessage?.message}
								</p>
							</div>
						</a>
					</li>
				{/each}
			</ul>
		</nav>
		<!-- --- -->
	</svelte:fragment>
	<slot />
</AppShell>
