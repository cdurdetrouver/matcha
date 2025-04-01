<script lang="ts">
	import Chat from '$lib/components/chat/Chat.svelte';
	import { PUBLIC_WEBSOCKET_HOST } from '$env/static/public';
	import { onMount } from 'svelte';

	export let data;

	let classes = {
		"personal":[
			"flex flex-col items-end justify-start gap-2 lg:flex-row-reverse lg:justify-start lg:items-start",
			"card w-fit p-4 rounded-tr-none space-y-2 variant-soft-primary"
		],
		"other":[
			"grid grid-rows-[auto_1fr] md:grid-cols-[auto_1fr] gap-2",
			"card w-fit p-4 rounded-tl-none space-y-2 variant-soft"
		]
	}
	let currentMessage = '';
	let socket:WebSocket;

	onMount(() => {
		socket = new WebSocket(PUBLIC_WEBSOCKET_HOST + `/api/chat/${data.chatid}`);

		socket.onopen = (event) => {
			console.log("socket open");
		}
		socket.onmessage = (event) => {
			console.log(event.data);
		};
		socket.onclose = (event) => {
			console.log("socket closed");
		}
	});

	function sendMessage()
	{
		if (socket && currentMessage != '')
			socket.send(JSON.stringify({ type: 'message', content: currentMessage}));
	}
</script>

<main class="h-[92vh] flex flex-col">
	<header class="h-fit">bonjour</header>
	<section class="h-full overflow-scroll">
		<ul class="size-full p-10 flex flex-col gap-2.5">
			{#each data.messages as message}
				<Chat {message} classes={classes[message.author.id === data.user.id ? "personal" : "other"]}/>
			{/each}
		</ul>
	</section>
	<div class="h-fit p-4">
		<form class="input-group input-group-divider grid-cols-[auto_1fr_auto] rounded-container-token" on:submit={sendMessage}>
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
