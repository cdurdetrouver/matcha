<script lang="ts">
	import { onMount, type SvelteComponent } from 'svelte';
	import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { request } from '$lib/script/request';
	import type { Date } from '$lib/types/date';
	import { formatDate } from '$lib/script/time';
	import Icon from '@iconify/svelte';

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
				description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
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
					lat: 0,
					long: 0,
					fame_rate: 0
				}
			},
			{
				id: 2,
				accepted: true,
				date: new Date('2025-11-15').getTime(),
				description: 'Meeting at the park for a walk and coffee.',
				user_to_meet: {
					id: 2,
					username: 'Jane Smith',
					avatar: {
						id: 2,
						link: 'https://example.com/avatar2.jpg',
						filename: 'avatar2.jpg',
						user_id: 2
					},
					created_at: new Date('2023-09-15').getTime(),
					connected_at: new Date('2023-09-20').getTime(),
					online: false,
					complete_profile: true,
					email_verif: true,
					wanted: 2,
					auth_provider: 'google',
					lat: 10,
					long: 20,
					fame_rate: 5
				}
			},
			{
				id: 3,
				accepted: true,
				date: new Date('2025-12-01').getTime(),
				description: 'Dinner at a fancy restaurant.',
				user_to_meet: {
					id: 3,
					username: 'Alice Johnson',
					avatar: {
						id: 3,
						link: 'https://example.com/avatar3.jpg',
						filename: 'avatar3.jpg',
						user_id: 3
					},
					created_at: new Date('2023-08-10').getTime(),
					connected_at: new Date('2023-08-15').getTime(),
					online: true,
					complete_profile: true,
					email_verif: true,
					wanted: 3,
					auth_provider: 'facebook',
					lat: 15,
					long: 25,
					fame_rate: 10
				}
			},
			{
				id: 4,
				accepted: false,
				date: new Date('2025-12-20').getTime(),
				description: 'Casual meetup at the library.',
				user_to_meet: {
					id: 4,
					username: 'Bob Brown',
					avatar: {
						id: 4,
						link: 'https://example.com/avatar4.jpg',
						filename: 'avatar4.jpg',
						user_id: 4
					},
					created_at: new Date('2023-07-01').getTime(),
					connected_at: new Date('2023-07-05').getTime(),
					online: false,
					complete_profile: true,
					email_verif: true,
					wanted: 4,
					auth_provider: 'email',
					lat: 30,
					long: 40,
					fame_rate: 8
				}
			}
		];

		dates = sortDates(dates);

		console.log(dates);
	});

	function sortDates(dates: Date[]): Date[] {
		return dates.sort((a, b) => {
			if (a.accepted !== b.accepted) {
				return a.accepted ? 1 : -1;
			}
			return a.date - b.date;
		});
	}

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
			toastStore.trigger(t);
		} else {
			const data = await res.json();
			if (data.message) {
				const t: ToastSettings = {
					message: data.message,
					background: 'variant-filled-success'
				};
				toastStore.trigger(t);
			}
		}
		modalStore.close();
	}
</script>

{#if $modalStore[0]}
	<div class="modal-example-form card p-4 w-modal shadow-xl space-y-4">
		{#if dates.length > 0}
			<div class="p-4 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
				{#each dates as date}
					<div class="card card-hover flex justify-between m-4 h-full">
						<div class="max-w-[70%] flex flex-col gap-4">
							<p>
								{date.user_to_meet.username}
							</p>
							<p>
								{date.description}
							</p>
						</div>
						<div class="h-full flex flex-col justify-between items-end">
							{formatDate(date.date)}
							{#if date.accepted == false}
								<div>
									<button
										type="button"
										class="btn variant-filled"
										on:click={() => acceptDate(date.id, true)}
									>
										<Icon icon="fluent-mdl2:accept" class="color-success-500" />
									</button>
									<button
										type="button"
										class="btn variant-filled"
										on:click={() => acceptDate(date.id, false)}
									>
										<Icon icon="fluent-mdl2:cancel" />
									</button>
								</div>
							{/if}
						</div>
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
