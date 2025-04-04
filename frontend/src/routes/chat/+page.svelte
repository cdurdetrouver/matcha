<script lang="ts">
	import { ChatsStore } from '$lib/stores/chats';
	import ListChats from '$lib/components/utils/ListChats.svelte';
	import type { Chat } from '$lib/types/chat.ts';

	export let data;

	let chats: Chat[] = [];
	ChatsStore.subscribe((value) => chats.push(...value));
</script>

<div class="hidden md:block size-full">
	<div class="size-full flex items-center justify-center">
		<h1 class="h1">Please select a chat to talk</h1>
	</div>
</div>

<div class="md:hidden block">
	<ListChats {chats} user={data.user} chatid={data.chatid} />
</div>
