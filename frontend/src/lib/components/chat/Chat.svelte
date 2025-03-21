<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton';
	import { formatDate } from '$lib/script/date';
	import Icon from '@iconify/svelte';

	export let message;
	export let classes;

	let isChecked = false;
</script>

<li class={classes[0]}>
	<Avatar src={message.author.avatar} width="w-12" />
	{#if message.type == 'chat'}
		<div class={classes[1]}>
			<header class="flex justify-between items-center gap-5">
				<p class="font-bold">{message.author.username}</p>
				<small class="opacity-50">{formatDate(message.created_at)}</small>
			</header>
			<p>{message.message}</p>
		</div>
	{:else if message.type == 'image'}
		<div class="cursor-pointer size-fit">
			{#if isChecked}
				<div class="fixed top-0 left-0 w-full h-full z-[1000] bg-black bg-opacity-80 flex justify-center items-center" 
					on:click={() => isChecked = !isChecked}
				>
					<button on:click={() => isChecked = !isChecked} type="button" class="absolute top-10 right-10 w-[5vw] h-[5vh]"><Icon icon="maki:cross"  style="color: #fff" class="size-full" /></button>
					<img
						src={message.image}
						alt="Message id {message.id}"
						class="max-w-[90vw] max-h-[90vh] md:max-w-[80vw] md:max-h-[80vh]"
						on:click|stopPropagation
					/>
				</div>
			{/if}
			<div class="card card-hover relative">
				<img src={message.image} alt="Message id {message.id}" class="rounded-xl max-w-[50vw] lg:max-w-[30vw]" on:click={() => isChecked = !isChecked}/>
			</div>
		</div>
	{/if}
</li>
