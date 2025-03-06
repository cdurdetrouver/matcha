<script lang="ts">
	import Logo from './Logo.svelte';
	import { AppBar, Avatar, popup } from '@skeletonlabs/skeleton';
	import Icon from '@iconify/svelte';

	let notifs: [] = ['test', 'bonjour']; // "test", "bonjour"
	export let user;
</script>

<AppBar shadow="shadow-2xl" slotTrail="!space-x-2">
	<svelte:fragment slot="lead">
		<div class="flex items-center space-x-4">
			<Logo />
		</div>
	</svelte:fragment>
	<svelte:fragment slot="trail">
		<div class="relative hidden lg:block">
			<a class="btn hover:variant-soft-primary cursor-pointer" href="/scroll">
				<span class="hidden select-none md:inline-block">Scroll</span>
			</a>
		</div>

		<div>
			<a class="btn hover:variant-soft-primary cursor-pointer" href="/map">
				<span class="hidden select-none md:inline-block">Map</span>
			</a>
		</div>

		<div>
			<a class="btn hover:variant-soft-primary cursor-pointer" href="/chat">
				<span class="hidden select-none md:inline-block">Chat</span>
			</a>
		</div>

		<section class="hidden sm:inline-flex space-x-{user == null ? '1' : '4'}">
			<button
				class="btn hover:variant-soft-primary"
				use:popup={{ event: 'click', target: 'notifs' }}
			>
				<Icon
					icon="mingcute:notification-{notifs.length == 0 ? '' : 'newdot-'}fill"
					width="24"
					height="24"
					style="color: #000"
				/>
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
			{#if user == null}
				<a class="btn-icon hover:variant-soft-primary" href="/login" rel="noreferrer">
					<Icon icon="mdi:account" width="24" height="24" />
				</a>
			{:else}
				<a class="btn-icon hover:variant-soft-primary" href="/profile" rel="noreferrer">
					<Avatar
						src="user.jpeg"
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
