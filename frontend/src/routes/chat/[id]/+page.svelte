<script lang="ts">
	import Chat from '$lib/components/chat/Chat.svelte';
	import PersonalChat from '$lib/components/chat/PersonalChat.svelte';

	export let data;

	let currentMessage = '';
</script>

<main class="h-[92vh] flex flex-col">
	<header class="h-fit">bonjour</header>
	<section class="h-full overflow-scroll">
		<ul class="size-full p-10 flex flex-col gap-2.5">
			{#each data.messages as message}
				{#if message.author.id === data.user.id}
					<PersonalChat {message} />
				{:else}
					<Chat {message} />
				{/if}
			{/each}
		</ul>
	</section>
	<div class="h-fit p-4">
		<div class="input-group input-group-divider grid-cols-[auto_1fr_auto] rounded-container-token">
			<button class="input-group-shim">+</button>
			<textarea
				bind:value={currentMessage}
				class="resize-none bg-transparent border-0 p-2 ring-0 field-sizing-content"
				name="prompt"
				id="prompt"
				placeholder="Write a message..."
				rows="1"
			/>
			<button class="variant-filled-primary">Send</button>
		</div>
	</div>
</main>

<style>
	.shadow-top {
		box-shadow:
			0 -8px 12px -1px rgba(0, 0, 0, 0.1),
			0 -4px 8px -1px rgba(0, 0, 0, 0.06);
	}
</style>
