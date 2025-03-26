<script lang="ts">
	import { AppShell } from '@skeletonlabs/skeleton';
	import ListChats from "$lib/components/utils/ListChats.svelte";

	export let data;
</script>

<AppShell
	slotSidebarLeft="bg-surface-500/5 w-[22vw] h-[92vh] p-4 overflow-y-auto hidden md:flex flex-col shadow-2xl"
>
	<svelte:fragment slot="sidebarLeft">
		<ListChats chats={data.chats} user={data.user} chatid={data.chatid}/>
	</svelte:fragment>
	<slot />
</AppShell>
