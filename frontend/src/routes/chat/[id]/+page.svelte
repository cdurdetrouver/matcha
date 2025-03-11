<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton';
	import Icon from '@iconify/svelte';
	export let data;

	function formatDate(timestamp: number): string {
		const date = new Date(timestamp);
		return date.toLocaleString();
	}
</script>

<main class="size-full grid grid-rows-12">
	<header class="row-span-1"></header>
	<section class="row-span-10">
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
						<div class="card w-fit p-4 variant-soft rounded-tl-none space-y-2">
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
	<div class="row-span-1 flex items-center justify-between gap-5 shadow-top">
		<Icon icon="ep:circle-plus-filled" width="10" height="10" style="color: #444" />
		<input type="search" class="input" />
	</div>
</main>

<style>
	.shadow-top {
		box-shadow:
			0 -8px 12px -1px rgba(0, 0, 0, 0.1),
			0 -4px 8px -1px rgba(0, 0, 0, 0.06);
	}
</style>
