<script lang="ts">
	import Logo from './Logo.svelte';
	import { AppBar, Avatar, popup } from '@skeletonlabs/skeleton';
	import Icon from "@iconify/svelte";

	let notifs:[] = []; // "test", "bonjour"
	let user = null;
</script>

<AppBar shadow="shadow-2xl" slotTrail="!space-x-2">
	<svelte:fragment slot="lead">
		<div class="flex items-center space-x-4">
			<Logo />
		</div>
	</svelte:fragment>
	<svelte:fragment slot="trail">
		<div class="relative hidden lg:block">
			<a class="btn hover:variant-soft-primary cursor-pointer">
				<span class="hidden select-none md:inline-block">Scroll</span>
			</a>
		</div>

		<div>
			<a class="btn hover:variant-soft-primary cursor-pointer">
				<span class="hidden select-none md:inline-block">Map</span>
			</a>
		</div>

		<div>
			<a class="btn hover:variant-soft-primary cursor-pointer">
				<span class="hidden select-none md:inline-block">Chat</span>
			</a>
		</div>

		<section class="hidden sm:inline-flex space-x-{user == null ? '1' : '4'}">
			<button class="btn hover:variant-soft-primary" use:popup={{ event: 'click', target: 'notifs' }}>
				<Icon icon="mingcute:notification-{notifs.length == 0 ? '' : 'newdot-'}fill" width="24" height="24"  style="color: #000" />
			</button>
			<div class="card p-4 w-60 shadow-xl" data-popup="notifs">
				{#if notifs.length != 0}
					<nav class="list-nav">
						<ul>
							{#each notifs as notif}
								<li>
									<a href="/">
										<span>{notif}</span>
									</a>
								</li>
							{/each}
						</ul>
					</nav>
				{:else}
					<span>No notifications for the moment</span>
				{/if}
			</div>
			<a class="btn-icon hover:variant-soft-primary" href="https://github.com/skeletonlabs/skeleton" target="_blank" rel="noreferrer">
				{#if user == null}
					<Icon icon="mdi:account" width="24" height="24" />
				{:else}
					<Avatar
						src="user.jpeg"
						alt="User Logo"	
						rounded="rounded-3xl"
						width="w-[40px]"
						shadow="shadow-xl"
					/>
				{/if}
			</a>
		</section>
	</svelte:fragment>
</AppBar>
