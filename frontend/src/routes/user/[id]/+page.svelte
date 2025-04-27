<script lang="ts">
	import type { User } from '$lib/types/user';
	import type { Image } from '$lib/types/image';
	import { goto } from '$app/navigation';
	import { request } from '$lib/script/request';
	import { onMount } from 'svelte';
	import { Avatar, getToastStore, type ToastSettings, getModalStore } from '@skeletonlabs/skeleton';
	import Icon from '@iconify/svelte';
	import { getCurrentPosition } from '$lib/script/location';

	const toastStore = getToastStore();
	const modalStore = getModalStore();

	export let data;

	let user: User;
	let city = '';
	let images: Image[] = [];

	onMount(async () => {
		const req = await request('/api/user/' + data.userid, {
			method: 'GET',
			credentials: 'include'
		});

		if (!req.ok) {
			const t: ToastSettings = {
				message: 'Failed to load user data',
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			goto('/');
		}

		const userdata = await req.json();
		user = userdata.user as User;
		if (!user) {
			const t: ToastSettings = {
				message: 'Failed to load user data',
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			goto('/');
		}
		city = await getCurrentPosition(user.location[0], user.location[1]);
		const res = await request('/api/user/image/' + user.id, {
			method: 'GET',
			credentials: 'include'
		});

		if (!res.ok) {
			const t: ToastSettings = {
				message: 'Failed to load user image',
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			goto('/');
		}
		const imageData = await res.json();
		images = imageData.images;
	});

	function openModal() {
		modalStore.trigger({
			type: 'alert',
			title: 'All Interests',
			body: user.interests
				?.map((interest) => `<span class="badge variant-filled">${interest}</span>`)
				.join(' ')
		});
	}

	function sendRequest(arg0: string): any {
		throw new Error('Function not implemented.');
	}
</script>

{#if user}
	<div class="flex flex-col items-center w-full max-w-4xl mx-auto p-4">
		<!-- Profile Header -->
		<div class="flex flex-col md:flex-row items-center md:items-start gap-6 w-full border-b pb-6">
			<!-- Avatar -->
			<div class="relative">
				<!-- Avatar -->
				<Avatar
					src={user.avatar?.link}
					alt="User Avatar"
					rounded="rounded-3xl"
					shadow="shadow-xl"
					class="h-full w-auto max-h-40 object-contain"
				/>

				<!-- Online/Offline Status -->
				<div
					class="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white bg-green-500"
					class:bg-green-500={user.online}
					class:bg-gray-400={!user.online}
				></div>
			</div>

			<!-- User Info -->
			<div class="flex flex-col items-center md:items-start gap-2">
				<!-- Username -->
				<h1 class="text-2xl font-bold">{user.username}</h1>

				<!-- Description -->
				<p class="text-center md:text-left">{user.description}</p>

				<!-- Location -->
				{#if city}
					<div class="flex items-center gap-4">
						<Icon icon="mdi:map-marker" width="1.5em" />
						<p class="text-sm text-gray-500">{city}</p>
					</div>
				{/if}

				<!-- Status -->
				<div class="flex items-center gap-4">
					<p class="text-sm text-gray-500">
						Looking for:
						{#if user.wanted === 1}
							friends and love
						{:else if user.wanted <= 1}
							friends
						{:else if user.wanted >= 1}
							love
						{/if}
					</p>
				</div>

				<!-- Interests -->
				<div class="flex items-center gap-4">
					{#each (user.interests ?? []).slice(0, 2) as interest}
						<span class="badge variant-filled">{interest}</span>
					{/each}
					{#if (user.interests ?? []).length > 2}
						<button class="px-2 py-1 bg-blue-500 rounded-full text-sm" on:click={openModal}>
							+{(user.interests ?? []).length - 2}
						</button>
					{/if}
				</div>

				<!-- Request Buttons -->
				<div class="flex gap-4 mt-4">
					{#if user.wanted <= 1 && data.user.wanted <= 1}
						<button
							class="px-4 py-2 bg-[#1e90ff] text-white rounded-lg hover:bg-green-600 transition"
							on:click={() => sendRequest('friend')}
						>
							Request Friend
						</button>
					{/if}
					{#if user.wanted >= 1 && data.user.wanted >= 1}
						<button
							class="px-4 py-2 bg-[#e32636] text-white rounded-lg hover:bg-red-600 transition"
							on:click={() => sendRequest('love')}
						>
							Request Love
						</button>
					{/if}
				</div>
			</div>
		</div>

		<!-- Image Grid -->
		<section class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6 w-full">
			{#each images as image}
				<div
					class="relative group aspect-[0.75] overflow-hidden bg-black flex items-center justify-center rounded-lg"
				>
					<img
						src={image.link}
						alt="Preview"
						class="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
					/>
				</div>
			{/each}
		</section>
	</div>
{/if}
