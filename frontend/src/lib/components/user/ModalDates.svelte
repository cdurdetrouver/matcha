<script lang="ts">
	import { onMount, type SvelteComponent } from 'svelte';
	import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { request } from '$lib/script/request';
	import type { Date } from '$lib/types/date';

	const modalStore = getModalStore();
	const toastStore = getToastStore();

	export let parent: SvelteComponent;

	let dates: Date[] = [];

	onMount(async () => {
		const res = await request('/api/date/all', {
			method: 'GET',
			credentials: 'include'
		});

		if (!res.ok) {
			console.log(await res.json());
			const t: ToastSettings = {
				message: 'Failed to load dates',
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			modalStore.close();
			return;
		}

		const data = await res.json();
		dates = data.dates as Date[];

		dates = [
			{
				id: 1,
				accepted: false,
				date: new Date('2025-10-10').getTime(),
				user_to_meet: {
					id: 1,
					username: 'Jhon Doe',
					avatar: {
						id: 1,
						link: 'https://example.com/image.jpg',
						filename: 'image.jpg',
						user_id: 1
					},
					created_at: new Date('2023-10-01').getTime(),
					connected_at: new Date('2023-10-01').getTime(),
					online: true,
					complete_profile: true,
					email_verif: true,
					wanted: 1,
					auth_provider: 'email',
					location: [1, 1]
				}
			}
		];
	});

	async function acceptDate(date_id: number, accept: boolean): Promise<void> {
		const res = await request('/api/date/accept', {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({
				date_id,
				accept
			})
		});

		if (!res.ok) {
			const t: ToastSettings = {
				message: `Failed to ${accept ? 'accept' : 'refuse'} date`,
				background: 'variant-filled-error'
			};
		}

		const data = await res.json();
		if (data.message) {
			const t: ToastSettings = {
				message: data.message,
				background: 'vartiant-filled-success'
			};
			toastStore.trigger(t);
		}
		modalStore.close();
	}
</script>

{#if $modalStore[0]}
	<div class="modal-example-form card p-4 w-modal shadow-xl space-y-4">
		{#if dates.length > 0}
			<div class="p-4">
				{#each dates as date}
					<div class="card card-hover">
						{date}
						{#if date.accepted == false}
							<button on:click={() => acceptDate(date.id, true)}>Accept</button>
							<button on:click={() => acceptDate(date.id, false)}>Refuse</button>
						{/if}
					</div>
				{/each}
			</div>
		{:else}
			<h1 class="text-2xl font-bold">No dates available</h1>
		{/if}
		<footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>
				{parent.buttonTextCancel}
			</button>
		</footer>
	</div>
{/if}
