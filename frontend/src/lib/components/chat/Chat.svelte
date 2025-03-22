<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton';
	import { formatDate } from '$lib/script/date';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte'

	export let message;
	export let classes;

	let isChecked = false;
	let content:string = '';

	const expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
	const regex = new RegExp(expression);

	function getLinks(message:string)
	{
		let stringArray:string[] = message.split(/(\s+)/);
		let newstring = new Array();
		for (var i = 0; i < stringArray.length; i++)
		{
			if (stringArray[i].match(regex))
			{
				newstring.push(`<a class="text-blue-500 underline" target="_blank" alt='website' href="${stringArray[i]}">${stringArray[i]}</a>`)
			}
			else
			{
				newstring.push(stringArray[i]);
			}
		}
		return (newstring.join(''));
	}

	onMount( async () => {
        content = getLinks(message.message);

		const video = document.getElementById('video');

		video.addEventListener('loadeddata', function() {
			const canvas = document.createElement('canvas');
			const context = canvas.getContext('2d');

			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;

			context.drawImage(video, 0, 0, canvas.width, canvas.height);

			const posterUrl = canvas.toDataURL();
			video.poster = posterUrl;
		});
    });
</script>

<li class={classes[0]}>
	<Avatar src={message.author.avatar} width="w-12" />
	{#if message.type == 'chat'}
		<div class={classes[1]}>
			<header class="flex justify-between items-center gap-5">
				<p class="font-bold">{message.author.username}</p>
				<small class="opacity-50">{formatDate(message.created_at)}</small>
			</header>
			<p>{@html content}</p>
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
			<div class="card card-hover relative" on:click={() => isChecked = !isChecked}>
				<img src={message.image} alt="Message id {message.id}" class="rounded-xl max-w-[50vw] lg:max-w-[30vw]"/>
			</div>
		</div>
	{:else if message.type == "video"}
		<div class="cursor-pointer size-fit">
			{#if isChecked}
				<div class="fixed top-0 left-0 w-full h-full z-[1000] bg-black bg-opacity-80 flex justify-center items-center" 
					on:click={() => isChecked = !isChecked}
				>
					<button on:click={() => isChecked = !isChecked} type="button" class="absolute top-10 right-10 w-[5vw] h-[5vh]"><Icon icon="maki:cross"  style="color: #fff" class="size-full" /></button>
					<video controls class="max-w-[90vw] max-h-[90vh] md:max-w-[80vw] md:max-h-[80vh]" src={message.video} on:click|stopPropagation>
				</div>
			{/if}
			<div class="card card-hover relative" on:click={() => isChecked = !isChecked}>
				<video id="video" class="rounded-xl max-w-[50vw] lg:max-w-[30vw]" src={message.video}/>
				<div class="absolute size-full top-0 left-0 z-[1] flex items-center justify-center">
					<Icon icon="streamline:button-play-solid" width="32" style="color: #fff" />
				</div>
			</div>
		</div>
	{/if}
</li>
