<script lang="ts">
	import { TabGroup, Tab, getToastStore } from '@skeletonlabs/skeleton';
	import Login from '$lib/components/Login/Login.svelte';
	import Register from '$lib/components/Login/Register.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { PUBLIC_BACKEND_HOST } from '$env/static/public';
	import { replaceState } from '$app/navigation';

	let tabSet: boolean = true;

	const toastStore = getToastStore();

	onMount(async () => {
		const url = new URL(window.location.href);
		const code = url.searchParams.get('code');
		const source = url.searchParams.get('source');
		if (code) {
			let res;
			if (source === 'google') {
				res = await fetch(`${PUBLIC_BACKEND_HOST}/api/user/login/google`, {
					method: 'POST',
					credentials: 'include',
					body: JSON.stringify({ code })
				});
			} else {
				res = await fetch(`${PUBLIC_BACKEND_HOST}/api/user/login/intra`, {
					method: 'POST',
					credentials: 'include',
					body: JSON.stringify({ code })
				});
			}
			if (res.status === 200) {
				const data = await res.json();
				if (data.message) {
					const t = {
						message: data.message,
						background: 'variant-filled-success'
					};
					toastStore.trigger(t);
				}
				goto('/complete');
			} else {
				const data = await res.json();
				console.error(data);
				const t = {
					message: 'Failed to login with ' + (source === 'google' ? 'Google' : 'Intra'),
					background: 'variant-filled-error'
				};
				toastStore.trigger(t);
			}

			url.searchParams.delete('code');
			url.searchParams.delete('source');
			replaceState(url, {});
		}
	});
</script>

<div class="size-full flex items-center justify-center">
	<section class="w-[20vw] min-w-[300px] card p-4 text-token">
		<TabGroup>
			<Tab bind:group={tabSet} name="login" value={true}>Login</Tab>
			<Tab bind:group={tabSet} name="register" value={false}>Register</Tab>
			<!-- Tab Panels --->
			<svelte:fragment slot="panel">
				{#if tabSet === true}
					<Login />
				{:else if tabSet === false}
					<Register />
				{/if}
			</svelte:fragment>
		</TabGroup>
	</section>
</div>
