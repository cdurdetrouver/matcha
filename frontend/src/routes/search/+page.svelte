<script lang="ts">
	import type { User } from '$lib/types/user';
	import {
		getModalStore,
		getToastStore,
		type ModalComponent,
		type ModalSettings
	} from '@skeletonlabs/skeleton';
	import ModalSearch from '$lib/components/search/ModalSearch.svelte';
	import { request } from '$lib/script/request.js';
	import Icon from '@iconify/svelte';

	const toastStore = getToastStore();

	export let data;

	let users: User[] = [];

	type SettingsType = {
		lat: number | undefined;
		long: number | undefined;
		radius: number | undefined;
		tags: string[] | undefined;
		fame_rate: number | undefined;
		minAge: number | undefined;
		maxAge: number | undefined;
		username: string | undefined;
	};
	let settings: SettingsType = {
		lat: undefined,
		long: undefined,
		radius: undefined,
		tags: undefined,
		fame_rate: undefined,
		minAge: undefined,
		maxAge: undefined,
		username: undefined
	};

	const modalStore = getModalStore();

	async function search() {
		if (settings.username == '') settings.username = undefined;
		const res = await request('/api/research/all', {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify(settings)
		});

		if (!res.ok) {
			const t = {
				message: 'Failed to fetch users',
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			return;
		}

		const data = await res.json();
		users = data.users;
	}

	function filterSize(settings: SettingsType): number {
		let score = 0;

		if (
			settings.lat !== undefined &&
			settings.long !== undefined &&
			settings.radius !== undefined
		) {
			score += 1;
		}

		if (Array.isArray(settings.tags) && settings.tags.length > 0) {
			score += 1;
		}

		if (settings.minAge !== undefined && settings.maxAge !== undefined) {
			score += 1;
		}

		if (typeof settings.username === 'string' && settings.username.trim() !== '') {
			score += 1;
		}

		return score;
	}

	function clearFilters() {
		settings = {
			lat: undefined,
			long: undefined,
			radius: undefined,
			tags: undefined,
			fame_rate: undefined,
			minAge: undefined,
			maxAge: undefined,
			username: undefined
		};
	}

	function triggerFilter() {
		const c: ModalComponent = { ref: ModalSearch };
		const modal: ModalSettings = {
			type: 'component',
			component: c,
			title: 'Choose your filters',
			body: 'Complete the form to filter users',
			meta: {
				user_lat: data.user.lat,
				user_long: data.user.long,
				settings
			},
			response: async (r) => {
				if (r) settings = r;
			}
		};
		modalStore.trigger(modal);
	}
</script>

<div class="size-full flex flex-col items-center justify-center p-10 gap-10">
	<header class="w-modal flex flex-col gap-4">
		<input type="text" placeholder="Username..." class="input p-2" bind:value={settings.username} />
		<div class="w-full flex item-center justify-between">
			<div class="btn-group variant-filled">
				<button type="button" on:click={clearFilters} disabled={filterSize(settings) == 0}>
					<Icon icon="tabler:trash" width="1.5rem" style="color: #f00" />
				</button>
				<button type="button" on:click={triggerFilter}>
					<Icon icon="codicon:settings" width="16" height="16" class="mr-[5px]" />
					Filters : {filterSize(settings)}
				</button>
			</div>
			<button type="button" class="btn variant-filled-primary" on:click={search}>Search</button>
		</div>
	</header>

	{#if users.length > 0}
		<div class="size-full text-token grid grid-cols-1 md:grid-cols-5 gap-4">
			{#each users as user}
				<a class="h-fit card card-hover overflow-hidden" href="/user/{user.id}">
					<header>
						<img
							src={user.avatar?.link}
							class="bg-black/50 w-full object-contain max-h-[30vh]"
							alt="Post"
						/>
					</header>
					<div class="p-4 space-y-4">
						<h3 class="h3" data-toc-ignore>{user.username}</h3>
						<hr />
						<article>
							<p>description:</p>
							<p>
								<!-- cspell:disable -->
								{user.description}
								<!-- cspell:enable -->
							</p>
						</article>
					</div>
				</a>
			{/each}
		</div>
	{:else}
		<div class="size-full flex items-center justify-center">
			<h3 class="h3">No Users founds</h3>
		</div>
	{/if}
</div>
