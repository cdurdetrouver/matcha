<script lang="ts">
	import Logo from './utils/Logo.svelte';
	import NotifComponent from './utils/Notif.svelte';
	import { AppBar, Avatar } from '@skeletonlabs/skeleton';
	import Icon from '@iconify/svelte';
	import type { PersonalUser } from '$lib/types/user';
	import type { Notif } from '$lib/types/notif';

	export let user: PersonalUser | null = null;
	export let notifs: Notif[] = [];
</script>

<AppBar shadow="shadow-2xl" slotTrail="!space-x-2">
	<svelte:fragment slot="lead">
		<div class="flex items-center space-x-4">
			<Logo />
		</div>
	</svelte:fragment>
	<svelte:fragment slot="trail">
		<div class="relative hidden lg:block">
			<a class="btn hover:variant-soft-primary cursor-pointer" href="/feed">
				<span class="hidden select-none md:inline-block">Feed</span>
			</a>
		</div>

		<div>
			<a class="btn hover:variant-soft-primary cursor-pointer" href="/chat">
				<span class="hidden select-none md:inline-block">Chat</span>
			</a>
		</div>

		<section class="hidden sm:inline-flex space-x-{user == null ? '1' : '4'}">
			<NotifComponent {notifs} />
			{#if user == null}
				<a class="btn-icon hover:variant-soft-primary" href="/login" rel="noreferrer">
					<Icon icon="mdi:account" width="24" height="24" />
				</a>
			{:else}
				<a class="btn-icon hover:variant-soft-primary" href="/profile" rel="noreferrer">
					<Avatar
						src={user.avatar}
						alt="User Logo"
						rounded="rounded-3xl"
						width="w-[40px]"
						shadow="shadow-xl"
					/>
				</a>
			{/if}
		</section>
	</svelte:fragment>
</AppBar>
