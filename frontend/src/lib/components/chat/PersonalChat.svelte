<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton';
	import { formatDate } from '$lib/script/date';

	export let message;
</script>

<li
	class="flex flex-col-reverse items-end justify-start gap-2 lg:flex-row lg:justify-end lg:items-start"
>
	{#if message.type == 'chat'}
		<div class="card w-fit p-4 rounded-tr-none space-y-2 variant-soft-primary">
			<header class="flex justify-between items-center gap-5">
				<p class="font-bold">{message.author.username}</p>
				<small class="opacity-50">{formatDate(message.created_at)}</small>
			</header>
			<p>{message.message}</p>
		</div>
	{:else if message.type == 'image'}
		<div class="card card-hover">
			<img src={message.image} class="rounded-xl max-w-[50vw] lg:max-w-[20vw]" />
		</div>
	{/if}
	<Avatar src={message.author.avatar} width="w-12" />
</li>
