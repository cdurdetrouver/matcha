<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton';
	import { formatDate } from '$lib/script/time';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	import type { Message } from '$lib/types/chat';

	export let message: Message;
	export let classes: string[];

	let isChecked = false;
	let content: string = '';

	const expression =
		/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
	const regex = new RegExp(expression);

	function getLinks(message: string) {
		let stringArray: string[] = message.split(/(\s+)/);
		let newstring = new Array();
		for (let i = 0; i < stringArray.length; i++) {
			if (stringArray[i].match(regex)) {
				newstring.push(
					`<a class="anchor" target="_blank" alt='website' href="${stringArray[i]}">${stringArray[i]}</a>`
				);
			} else {
				newstring.push(stringArray[i].replace(/\n/g, '<br>'));
			}
		}
		return newstring.join('');
	}

	onMount(async () => {
		if (message.content) content = getLinks(message.content);

		const video = document.getElementById('myVideo') as HTMLVideoElement;

		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');

		if (video && context) {
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;

			video.currentTime = 0.1;

			video.addEventListener('seeked', function () {
				context.drawImage(video, 0, 0, canvas.width, canvas.height);

				const dataUrl = canvas.toDataURL();

				video.setAttribute('poster', dataUrl);
			});
		}
	});
</script>

<div class={classes[0]}>
	{#if message.author?.avatar}
		<Avatar src={message.author?.avatar.link} width="w-12" />
	{:else}
		<Avatar src="/images/default-avatar.png" width="w-12" />
	{/if}
	{#if message.type == 'chat'}
		<div class={classes[1]}>
			<header class="flex justify-between items-center gap-5">
				<p class="font-bold">{message.author?.username}</p>
				<small class="opacity-50">{formatDate(message.created_at)}</small>
			</header>
			<p>{@html content}</p>
		</div>
	{:else if message.type == 'image'}
		<div class="cursor-pointer size-fit">
			{#if isChecked}
				<button
					type="button"
					class="fixed top-0 left-0 w-full h-full z-[1000] bg-black bg-opacity-80 flex justify-center items-center"
					on:click={() => (isChecked = !isChecked)}
				>
					<button
						on:click={() => (isChecked = !isChecked)}
						type="button"
						class="absolute top-10 right-10 w-[5vw] h-[5vh]"
						><Icon icon="maki:cross" style="color: #fff" class="size-full" /></button
					>
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
					<img
						src={message.image}
						alt="Message id {message.id}"
						class="max-w-[90vw] max-h-[90vh] md:max-w-[80vw] md:max-h-[80vh]"
						on:click|stopPropagation
					/>
				</button>
			{/if}
			<button
				type="button"
				class="card card-hover relative"
				on:click={() => (isChecked = !isChecked)}
			>
				<img
					src={message.image}
					alt="Message id {message.id}"
					class="rounded-xl max-w-[50vw] lg:max-w-[30vw]"
				/>
			</button>
		</div>
	{:else if message.type == 'video'}
		<div class="cursor-pointer size-fit">
			{#if isChecked}
				<button
					type="button"
					class="fixed top-0 left-0 w-full h-full z-[1000] bg-black bg-opacity-80 flex justify-center items-center"
					on:click={() => (isChecked = !isChecked)}
				>
					<button
						type="button"
						on:click={() => (isChecked = !isChecked)}
						class="absolute top-10 right-10 w-[5vw] h-[5vh]"
						><Icon icon="maki:cross" style="color: #fff" class="size-full" /></button
					>
					<!-- svelte-ignore a11y-media-has-caption -->
					<video
						controls
						class="max-w-[90vw] max-h-[90vh] md:max-w-[80vw] md:max-h-[80vh]"
						src={message.video}
						on:click|stopPropagation
					>
					</video></button
				>
			{/if}
			<button
				type="button"
				class="card card-hover relative"
				on:click={() => (isChecked = !isChecked)}
			>
				<!-- svelte-ignore a11y-media-has-caption -->
				<video id="myVideo" class="rounded-xl max-w-[50vw] lg:max-w-[30vw]" src={message.video} />
				<div class="absolute size-full top-0 left-0 z-[1] flex items-center justify-center">
					<Icon icon="streamline:button-play-solid" width="32" style="color: #fff" />
				</div>
			</button>
		</div>
	{/if}
</div>
