<script lang="ts">
	import { type Notif } from '$lib/types/notif';
	import { popup } from '@skeletonlabs/skeleton';
	import Icon from '@iconify/svelte';

	export let notifs: Notif[];

	function deleteNotif(notif_id: number) {
		notifs = notifs.filter((notif) => notif.id !== notif_id);
	}

	function timeDifference(current: number, previous: number) {
		const msPerMinute = 60 * 1000;
		const msPerHour = msPerMinute * 60;
		const msPerDay = msPerHour * 24;
		const msPerMonth = msPerDay * 30;
		const msPerYear = msPerDay * 365;

		const elapsed = current - previous;

		if (elapsed < msPerMinute) {
			return 'now';
		} else if (elapsed < msPerHour) {
			return Math.round(elapsed / msPerMinute) + ' minutes ago';
		} else if (elapsed < msPerDay) {
			return Math.round(elapsed / msPerHour) + ' hours ago';
		} else if (elapsed < msPerMonth) {
			return Math.round(elapsed / msPerDay) + ' days ago';
		} else if (elapsed < msPerYear) {
			return Math.round(elapsed / msPerMonth) + ' months ago';
		} else {
			return Math.round(elapsed / msPerYear) + ' years ago';
		}
	}
</script>

<button class="btn hover:variant-soft-primary" use:popup={{ event: 'click', target: 'notifs' }}>
	<Icon
		icon="mingcute:notification-{notifs.length == 0 ? '' : 'newdot-'}fill"
		width="24"
		height="24"
	/>
</button>
<div class="card p-4 w-80 shadow-xl" data-popup="notifs">
	{#if notifs.length != 0}
		<nav class="list-nav max-h-[30vh] overflow-y-auto">
			<ul>
				{#each notifs as notif}
					{#if notif != notifs[0]}
						<hr />
					{/if}
					<a href={notif.redirect} class="grid grid-cols-5 h-[5vh] group items-center relative">
						<span class="col-span-4">{notif.content}</span>
						<div class="col-span-1 h-full">
							<span class="absolute right-0 bottom-0 ml-2 group-hover:hidden text-gray-400 text-xs">
								{timeDifference(Date.now(), notif.send_at)}
							</span>
							<button
								on:click={(event) => {
									event.preventDefault();
									deleteNotif(notif.id);
								}}
								type="button"
								class="z-1000 size-full flex items-center justify-center group-hover:inline ml-2"
							>
								<Icon
									icon="tabler:trash"
									width="24"
									height="24"
									class="hidden group-hover:inline"
									style="color: #f00"
								/>
							</button>
						</div>
					</a>
				{/each}
			</ul>
		</nav>
	{:else}
		<div class="w-full h-10 flex items-center justify-center">
			<span>No notifications for the moment</span>
		</div>
	{/if}
</div>
