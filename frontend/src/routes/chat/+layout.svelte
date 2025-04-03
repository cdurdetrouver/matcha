<script lang="ts">
	import { AppShell } from '@skeletonlabs/skeleton';
	import ListChats from '$lib/components/utils/ListChats.svelte';
	import type { Chat } from '$lib/types/chat.ts';
	import { onMount } from 'svelte';
	import { request } from '$lib/script/request.js';
	import { goto } from '$app/navigation';
	import { ChatsStore } from '$lib/stores/chats.js';

	export let data;

	let chats: Chat[] = [];

	onMount(async () => {
		const res = await request('/api/user/chats  ', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!res.ok && res.status != 404) {
			console.error('Failed to fetch chats');
			goto('/login');
		}

		const data = await res.json();
		chats = data.chats;
		ChatsStore.set(chats);
	});
</script>

<AppShell
	slotSidebarLeft="bg-surface-500/5 w-[22vw] h-[92vh] p-4 overflow-y-auto hidden md:flex flex-col shadow-2xl"
>
	<svelte:fragment slot="sidebarLeft">
		<ListChats {chats} user={data.user} chatid={data.chatid} />
	</svelte:fragment>
	<slot />
</AppShell>
