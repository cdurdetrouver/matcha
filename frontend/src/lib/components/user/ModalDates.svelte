<script lang="ts">
	import { onMount, type SvelteComponent } from 'svelte';
	import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { request } from '$lib/script/request';
	import type { Date } from '$lib/types/date';
	import { formatDate } from '$lib/script/time';
	import Icon from '@iconify/svelte';
	import type { User } from '$lib/types/user';

	const modalStore = getModalStore();
	const toastStore = getToastStore();

	export let parent: SvelteComponent;

	let dates: Date[] = $modalStore[0].meta.dates || [];
	let users: User[] = $modalStore[0].meta.dates.map((date) => {
		if (date.user_to_meet.id === $modalStore[0].meta.user.id) {
			return date.user;
		} else {
			return date.user_to_meet;
		}
	});
	let user: User = $modalStore[0].meta.user;

	onMount(async () => {
		dates = sortDates(dates);
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
			<div class="p-4 flex flex-col max-h-[80vh] overflow-y-auto">
				{#each dates as date, index}
					{#if users[index] == undefined}
						<p class="text-sm text-gray-500">Loading...</p>
					{:else}
						<div
							class="card card-hover flex flex-col md:flex-row justify-between m-4 p-6 shadow-lg rounded-lg gap-7"
						>
							<div class="flex items-center gap-4">
								<a href="/user/{users[index].id}" on:click={parent.onClose}>
									<img
										src={users[index].avatar?.link}
										alt="User Avatar"
										class="rounded-full w-16 h-16"
										loading="lazy"
									/>
								</a>
								<div class="flex flex-col">
									<h2 class="text-lg font-bold">{users[index].username}</h2>
									<p class="text-sm">{formatDate(date.date)}</p>
								</div>
							</div>
							<div class="mt-4 md:mt-0 flex-1 flex flex-col justify-between">
								<p class="text-sm md:text-base leading-relaxed">
									{date.description}
								</p>
								{#if date.accepted == false}
									{#if date.user_to_meet.id == user.id}
										<div class="mt-4 flex gap-2 justify-end">
											<button
												type="button"
												class="btn variant-filled hover:variant-filled-success px-4 py-2 rounded-md flex items-center gap-2"
												on:click={() => acceptDate(date.id, true)}
											>
												<Icon icon="fluent-mdl2:accept" class="w-5 h-5" />
												<p>Accept</p>
											</button>
											<button
												type="button"
												class="btn variant-filled hover:variant-filled-error text px-4 py-2 rounded-md flex items-center gap-2"
												on:click={() => acceptDate(date.id, false)}
											>
												<Icon icon="fluent-mdl2:cancel" class="w-5 h-5" />
												<span>Decline</span>
											</button>
										</div>
									{:else}
										<p class="text-sm text-gray-500">
											Waiting for {date.user_to_meet.username} to accept
										</p>
									{/if}
								{/if}
							</div>
						</div>
					{/if}
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
