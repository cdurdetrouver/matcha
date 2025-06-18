<script lang="ts">
	import '../app.postcss';
	import { AppShell } from '@skeletonlabs/skeleton';
	import { initializeStores, Toast, Modal } from '@skeletonlabs/skeleton';
	import MainAppBar from '$lib/components/MainAppBar.svelte';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import { autoModeWatcher } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import type { Notif } from '$lib/types/notif.ts';
	import { WebSocketManager } from '$lib/script/request';
	import { acceptCall, endCall } from '$lib/script/call';
	import { CallStore, type CallState } from '$lib/stores/calls';

	initializeStores();
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	export let data;

	export let socket: WebSocketManager;
	let notifs: Notif[] = [];

	onMount(() => {
		socket = new WebSocketManager('/api/notif/ws');
		CallStore.update((s: CallState) => {
			s.socket = socket;
			s.is_Call = 0;
			return s;
		});
		socket.setOnOpenHook(() => {
			if (!data.user) {
				socket.close();
				return;
			}
			data.user.online = true;
		});

		socket.setOnMessageHook(async (message) => {
			const state = get(CallStore);
			switch (message.type) {
				case 'new':
					notifs = [...notifs, message.notif];
					break;
				case 'init':
					notifs = message.notifs;
					break;
				case 'callOffer':
					let is_accepting = true;
					const content = JSON.parse(message.notif.content);
					// inform the user about the incoming video call
					if (is_accepting) {
						try {
							await acceptCall(content.offer, content.video, content.caller_id);
						}
						catch (err) {
							console.error('Error accepting video call:', err);
							endCall();
							socket.send({
								type: 'callReject',
								target_id: content.caller_id,
							});
							return;
						}
					}
					else {
						socket.send({
							type: 'callReject',
							target_id: content.caller_id,
						});
					}
					break;
				case 'callAnswer':
					const data_content = JSON.parse(message.notif.content);
					const answer = data_content.answer;
					await (state.peerConnection).setRemoteDescription(new RTCSessionDescription(answer));
					CallStore.update((s: CallState) => {
						s.peerConnection = state.peerConnection;
						s.pendingCandidates = [];
						s.answer = 2;
						return s;
					});
					break;
				case 'callReject':
					console.log('callRejected try the outer world make some real friends or find love lol');
					await endCall();
					break;
				case 'ice-candidate':
					try {
						const candidate: RTCIceCandidateInit = JSON.parse(message.notif.content).candidate;
						if (state.answer === 0) {
							CallStore.update((s: CallState) => {
								s.pendingCandidates.push(candidate);
								return s;
							});
						}
						else {
							await state.peerConnection.addIceCandidate(candidate);
						}
					} catch (err) {
						console.error('Error adding received ICE candidate:', err);
					}
					break;
				case 'endCall':
					await endCall(true);
					break;
				default:
					console.log('Unknown message type:', message.type, message);
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
