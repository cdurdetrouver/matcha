<script lang="ts">
	import '../app.postcss';
	import { AppShell } from '@skeletonlabs/skeleton';
	import { initializeStores, Toast } from '@skeletonlabs/skeleton';
	import MainAppBar from '$lib/components/MainAppBar.svelte';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import { autoModeWatcher } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { PUBLIC_WEBSOCKET_HOST } from '$env/static/public';
	import type { Notif } from '$lib/types/notif.ts';

	initializeStores();
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	export let data;

	let socket;
	let notifs: Notif[] = [];

	onMount(() => {
		socket = new WebSocket(PUBLIC_WEBSOCKET_HOST + '/api/notif/ws');

		socket.onmessage = (event) => {
			const data = JSON.parse(event.data);
			console.log(data);
			if (data.type === 'new')
				notifs.push(data.notif);
			else
				notifs = [...notifs, data.notifs];
		};
	});
</script>

<svelte:head>
	<title>Matcha</title>
	{@html '<script>(' + autoModeWatcher.toString() + ')();</script>'}
</svelte:head>

<Toast />

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<MainAppBar user={data.user} {notifs} />
	</svelte:fragment>
	<slot />
</AppShell>
