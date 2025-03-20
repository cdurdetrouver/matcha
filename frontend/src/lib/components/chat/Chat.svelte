<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton';
	import { formatDate } from '$lib/script/date';

	export let message;
</script>

<li class="grid grid-cols-[auto_1fr] gap-2">
	<Avatar src={message.author.avatar} width="w-12" />
	{#if message.type == 'chat'}
		<div class="card w-fit p-4 rounded-tl-none space-y-2 variant-soft">
			<header class="flex justify-between items-center gap-5">
				<p class="font-bold">{message.author.username}</p>
				<small class="opacity-50">{formatDate(message.created_at)}</small>
			</header>
			<p>{message.message}</p>
		</div>
	{:else if message.type == 'image'}
		<div>image</div>
	{/if}
</li>
