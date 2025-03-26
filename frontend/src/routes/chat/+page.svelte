<script>
	import ListChats from "$lib/components/utils/ListChats.svelte";

	export let data;

</script>

<div class="hidden md:block">
	<div class="size-full flex items-center justify-center">
		<h1 class="h1">Please select a chat to talk</h1>
	</div>
</div>

<div class="md:hidden block">
	<ListChats chats={data.chats} user={data.user} chatid={data.chatid}/>
</div>
