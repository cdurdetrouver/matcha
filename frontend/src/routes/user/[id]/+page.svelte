<script lang="ts">
	import type { User } from '$lib/types/user';
	import type { Image } from '$lib/types/image';
	import { goto } from '$app/navigation';
	import { request, WebSocketManager } from '$lib/script/request';
	import { onDestroy, onMount } from 'svelte';
	import {
		Avatar,
		getToastStore,
		type ToastSettings,
		getModalStore,
		type ModalSettings,
		type PopupSettings,
		popup,
		type ModalComponent
	} from '@skeletonlabs/skeleton';
	import Icon from '@iconify/svelte';
	import { getCurrentPosition } from '$lib/script/location';
	import { formatDate } from '$lib/script/time.js';
	import ModalCreateDate from '$lib/components/user/ModalCreateDate.svelte';

	const toastStore = getToastStore();
	const modalStore = getModalStore();

	export let data;

	let user: User;
	let related: number | null = null;
	let city = '';
	let images: Image[] = [];

	let socket: WebSocketManager;

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

		const res_relation = await request('/api/relations/' + user.id, {
			method: 'GET',
			credentials: 'include'
		});
		if (res_relation.status === 200) {
			const relationData = await res_relation.json();
			related = relationData.relation?.relation;
		}

		socket = new WebSocketManager(`/api/seen/ws?target_user_id=${user.id}`);

		// console.log(socket);
	});

	onDestroy(() => {
		if (socket) {
			socket.close();
		}
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

	async function sendRequest(arg0: string) {
		const relation = arg0 === 'friend' ? 0 : 2;
		const res = await request('/api/relations/create', {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({
				target_id: user.id,
				relation: relation
			})
		});
		if (res.status === 200) {
			const t: ToastSettings = {
				message: 'Request sent',
				background: 'variant-filled-success'
			};
			toastStore.trigger(t);
		} else {
			const t: ToastSettings = {
				message: 'Failed to send request: ' + (await res.json()).message,
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
		}
	}

	const Reasonlist = ['Inappropriate content', 'Spam', 'fake account'];

	const reportClick: PopupSettings = {
		event: 'click',
		target: 'reportClick',
		placement: 'bottom'
	};

	function Report(reason: string) {
		const modal: ModalSettings = {
			type: 'confirm',
			title: 'Please Confirm',
			body: `Are you sure you want to report <alert class="code">${data.user.username}</alert> for <alert class="code">${reason}</alert>`,
			response: async (r: boolean) => {
				if (r) {
					const res = await request('/api/report/user', {
						method: 'POST',
						body: JSON.stringify({
							target_id: user.id,
							reason
						})
					});

					if (!res.ok) {
						const t: ToastSettings = {
							message: 'Failed to report user: ' + (await res.json()).message,
							background: 'variant-filled-error'
						};
						toastStore.trigger(t);
						return;
					}

					const t: ToastSettings = {
						message: 'User report successfully',
						background: 'variant-filled-success'
					};
					toastStore.trigger(t);
					return;
				}
			}
		};
		modalStore.trigger(modal);
	}

	function Block() {
		const modal: ModalSettings = {
			type: 'confirm',
			title: 'Please Confirm',
			body: `Are you sure you want to block <alert class="code">${data.user.username}</alert> ?`,
			response: async (r: boolean) => {
				if (r) {
					const res = await request('/api/user/block_user/' + user.id, {
						method: 'POST'
					});

					if (!res.ok) {
						const t: ToastSettings = {
							message: 'Failed to block user: ' + (await res.json()).message,
							background: 'variant-filled-error'
						};
						toastStore.trigger(t);
						return;
					}

					const t: ToastSettings = {
						message: 'User block successfully',
						background: 'variant-filled-success'
					};
					toastStore.trigger(t);
					goto('/user');
				}
			}
		};
		modalStore.trigger(modal);
	}

	function dateCreateModal() {
		const c: ModalComponent = { ref: ModalCreateDate };
		const modal: ModalSettings = {
			type: 'component',
			component: c,
			title: 'Calendar',
			body: 'Create a date',
			meta: {
				user_id: user.id
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

				<!-- Relation Status -->
				<div class="flex items-center gap-2">
					{#if related === 0}
						<p>Asked you to be friend</p>
						<Icon icon="mdi:fire" class="text-[#1e90ff] h-auto w-[1.5rem]" />
					{:else if related === 2}
						<p>Asked you to be lovers</p>
						<Icon icon="mdi:fire" class="text-[#e32636] h-auto w-[1.5rem]" />
					{/if}
				</div>

				<!-- Last Connection -->
				{#if user.online == false}
					<div class="flex items-center gap-4">
						<p class="text-sm text-gray-500">
							last connection : {formatDate(user.connected_at)}
						</p>
					</div>
				{/if}

				<!-- Request Buttons -->
				<div class="flex gap-4 mt-4">
					{#if user.wanted <= 1 && data.user.wanted <= 1}
						<button
							type="button"
							class="btn btn-hover px-4 py-2 bg-[#1e90ff] text-white rounded-lg"
							on:click={() => sendRequest('friend')}
						>
							Request Friend
						</button>
					{/if}
					{#if user.wanted >= 1 && data.user.wanted >= 1}
						<button
							type="button"
							class="btn btn-hover px-4 py-2 bg-[#e32636] text-white rounded-lg"
							on:click={() => sendRequest('love')}
						>
							Request Love
						</button>
					{/if}
				</div>
			</div>

			<div class="flex flex-col justify-between items-end md:ml-auto h-full gap-4">
				<div class="flex gap-2">
					<button
						class="btn variant-filled-primary px-6 py-2"
						type="button"
						use:popup={reportClick}
					>
						Report
					</button>
					<div class="card p-4 max-w-sm" data-popup="reportClick">
						<div class="grid grid-cols-1 gap-2">
							{#each Reasonlist as reason}
								<button
									class="btn variant-filled-primary"
									type="button"
									on:click={() => Report(reason)}>{reason}</button
								>
							{/each}
						</div>
					</div>
					<button class="btn variant-filled-primary px-6 py-2" type="button" on:click={Block}>
						Block
					</button>
				</div>
				<div class="relative">
					<button
						class="btn variant-filled-primary px-6 py-2 flex gap-2"
						type="button"
						on:click={dateCreateModal}
					>
						<Icon icon="mdi:calendar-outline" />
						Set a date
					</button>
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
