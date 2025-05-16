<script lang="ts">
	import '../app.postcss';
	import { AppShell } from '@skeletonlabs/skeleton';
	import { initializeStores, Toast, Modal } from '@skeletonlabs/skeleton';
	import MainAppBar from '$lib/components/MainAppBar.svelte';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import { autoModeWatcher } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import type { Notif } from '$lib/types/notif.ts';
	import { WebSocketManager } from '$lib/script/request';
	import { getToastStore, type ToastSettings, } from '@skeletonlabs/skeleton';

	
	initializeStores();
	const toastStore = getToastStore();
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	export let data;

	let socket: WebSocketManager;
	let notifs: Notif[] = [];

	onMount(() => {
		socket = new WebSocketManager('/api/notif/ws');

		socket.setOnOpenHook(() => {
			if (!data.user) {
				socket.close();
				return;
			}
			data.user.online = true;
		});

		socket.setOnMessageHook((message) => {
			console.log('Received message:', message);
			if (message.type === 'new') notifs = [...notifs, message.notif];
			else if (message.type === 'init') notifs = message.notifs;
			else if (message.type === 'VideoCall') {
				//popup call
				const toastSettings: ToastSettings = {
					title: 'Incoming Video Call',
					message: message.notif.message,
					duration: 0,
					actions: [
						{
							label: 'Accept',
							onClick: () => {
								// Handle accept action
								socket.send({
									type: 'accept',
									callerId: message.notif.callerId,
									calleeId: data.user.id
								});
							}
						},
						{
							label: 'Decline',
							onClick: () => {
								// Handle decline action
								socket.send({
									type: 'decline',
									callerId: message.notif.callerId,
									calleeId: data.user.id
								});
							}
						}
					]
				};
				toastStore.addToast(toastSettings);
			}
		});
	});
</script>

<svelte:head>
	<title>Matcha</title>
	{@html '<script>(' + autoModeWatcher.toString() + ')();</script>'}
</svelte:head>

<Toast />
<Modal />

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<MainAppBar user={data.user} {notifs} {socket} />
	</svelte:fragment>
	<slot />
</AppShell>
