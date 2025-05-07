<script lang="ts">
	import type { User } from '$lib/types/user';
	import type { Image } from '$lib/types/image';
	import type { Date } from '$lib/types/date';
	import { goto } from '$app/navigation';
	import { logoutUser, request } from '$lib/script/request';
	import { onMount } from 'svelte';
	import {
		Avatar,
		getToastStore,
		type ToastSettings,
		getModalStore,
		type ModalSettings,
		type ModalComponent
	} from '@skeletonlabs/skeleton';
	import Icon from '@iconify/svelte';
	import { getCurrentPosition } from '$lib/script/location';
	import ModalDates from '$lib/components/user/ModalDates.svelte';

	const toastStore = getToastStore();
	const modalStore = getModalStore();
	let user: User;
	let city = '';
	let images: Image[] = [];
	let dates: Date[] = [];
	let lendate = 0;

	onMount(async () => {
		const req = await request('/api/user/me', {
			method: 'GET',
			credentials: 'include'
		});

		if (!req.ok) {
			await logout();
		}

		const data = await req.json();
		user = data.user as User;
		if (!user) {
			const t: ToastSettings = {
				message: 'Failed to load user data',
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			goto('/');
		}
		city = await getCurrentPosition(user.lat, user.long);
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

		const res2 = await request('/api/date/all', {
			method: 'GET',
			credentials: 'include'
		});

		if (!res2.ok) {
			const t: ToastSettings = {
				message: 'Failed to load dates',
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			return;
		}

		const data_res = await res2.json();
		dates = data_res.dates as Date[];

		lendate = dates.filter(
			(date) => date.accepted === false && date.user_to_meet.id === user.id
		).length;
	});

	async function logout() {
		await logoutUser();
		goto('/login');
	}

	function openModal() {
		modalStore.trigger({
			type: 'alert',
			title: 'All Interests',
			body: user.interests
				?.map((interest) => `<span class="badge variant-filled">${interest}</span>`)
				.join(' ')
		});
	}

	function dateModal() {
		const c: ModalComponent = { ref: ModalDates };
		const modal: ModalSettings = {
			type: 'component',
			component: c,
			title: 'Calendar',
			body: 'Manage your dates',
			meta: {
				dates,
				user
			},
			response: async (data: any) => {
				const res2 = await request('/api/date/all', {
					method: 'GET',
					credentials: 'include'
				});

				if (!res2.ok) {
					const t: ToastSettings = {
						message: 'Failed to load dates',
						background: 'variant-filled-error'
					};
					toastStore.trigger(t);
					return;
				}

				const data_res = await res2.json();
				dates = data_res.dates as Date[];

				lendate = dates.filter(
					(date) => date.accepted === false && date.user_to_meet.id === user.id
				).length;
			}
		};
		modalStore.trigger(modal);
	}
</script>

{#if user}
	<div class="flex flex-col items-center w-full max-w-4xl mx-auto p-4 h-[50vh]">
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

				<!-- Fame_rate -->
				<span class="badge-icon variant-filled absolute -top-0 -left-0 z-10"
					>{(Math.round(user.fame_rate * 10) / 10).toFixed(1)}</span
				>

				<!-- Online/Offline Status -->
				<div
					class="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white bg-green-500"
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
					<div class="flex items-center gap-2">
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
				{#if user?.complete_profile == false}
					<a href="/complete" class="btn variant-filled mt-4">Complete your profile</a>
				{/if}
			</div>

			<div class="flex flex-col justify-between md:items-end items-center md:ml-auto h-full gap-4">
				<div class="flex gap-2">
					<a class="btn variant-filled-primary px-6 py-2" href="/user/edit">Edit Profile</a>
					<button class="btn variant-filled-primary px-6 py-2" type="button" on:click={logout}>
						Logout
					</button>
				</div>
				<div class="relative">
					<button
						class="btn variant-filled-primary px-6 py-2 flex gap-2"
						type="button"
						on:click={dateModal}
					>
						<Icon icon="mdi:calendar-outline" />
						Calendar
					</button>

					{#if lendate > 0}
						<span class="badge-icon variant-filled absolute -top-0 -right-0 z-10"
							>{dates.length}</span
						>
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
