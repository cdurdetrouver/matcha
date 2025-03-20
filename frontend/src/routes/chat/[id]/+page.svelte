<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton';
	import Icon from '@iconify/svelte';
	export let data;

	let currentMessage = '';

	function formatDate(timestamp: number): string {
		const date = new Date(timestamp);
		return date.toLocaleString();
	}
</script>

<main class="size-full flex flex-col">
	<header class="h-fit">bonjour</header>
	<section class="h-full overflow-scroll">
		<ul class="size-full p-10 flex flex-col gap-2.5">
			{#each data.messages as message}
				{#if message.author.id === data.user.id}
					<li class="flex gap-2 justify-end items-start">
						<div class="card w-fit p-4 rounded-tr-none space-y-2 variant-soft-primary">
							<header class="flex justify-between items-center gap-5">
								<p class="font-bold">{message.author.username}</p>
								<small class="opacity-50">{formatDate(message.created_at)}</small>
							</header>
							<p>{message.message}</p>
						</div>
						<Avatar src={message.author.avatar} width="w-12" />
					</li>
				{:else}
					<li class="grid grid-cols-[auto_1fr] gap-2">
						<Avatar src={message.author.avatar} width="w-12" />
						<div class="card w-fit p-4 rounded-tl-none space-y-2 variant-soft">
							<header class="flex justify-between items-center gap-5">
								<p class="font-bold">{message.author.username}</p>
								<small class="opacity-50">{formatDate(message.created_at)}</small>
							</header>
							<p>{message.message}</p>
						</div>
					</li>
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
