<script lang="ts">
	import Chat from '$lib/components/chat/Chat.svelte';
	import Announce from '$lib/components/chat/Announce.svelte';
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	import type { Message, Chat as ChatType } from '$lib/types/chat.js';
	import { WebSocketManager } from '$lib/script/request.js';
	import { tick } from 'svelte';
	import { ChatsStore } from '$lib/stores/chats.js';
	import { getToastStore, type ToastSettings, } from '@skeletonlabs/skeleton';

	const toastStore = getToastStore();

	export let data;	
	let showCallMenu = false;
	let is_videoCall = false;
	let is_audioCall = false;

	let chats: ChatType[] = [];
	ChatsStore.subscribe((value) => chats.push(...value));
	
	function toggleCallMenu() {
		showCallMenu = !showCallMenu;
	}

	let classes = {
		personal: [
			'flex flex-col items-end justify-start gap-2 lg:flex-row-reverse lg:justify-start lg:items-start',
			'card w-fit p-4 rounded-tr-none space-y-2 variant-soft-primary'
		],
		other: [
			'grid grid-rows-[auto_1fr] md:grid-cols-[auto_1fr] gap-2',
			'card w-fit p-4 rounded-tl-none space-y-2 variant-soft'
		]
	};

	let chatContainer: HTMLElement;
	let textarea: HTMLElement;
	let chat: ChatType | undefined;
	let messages: Message[] = [];
	let currentMessage = '';
	let socket: WebSocketManager;

	onMount(async () => {
		chat = chats.find((chat) => chat.id === data.chatid);
		socket = new WebSocketManager(`/api/chat/${data.chatid}`);

		socket.setOnMessageHook(async (data) => {
			console.log('Received data:', data);
			if (data.type === 'init') messages = data.messages;
			else if (data.type === 'message') messages = [...messages, data.message];
			else if (data.type === 'history') messages = [...data.messages, ...messages];

			if (data.type !== 'history') await scrollToBottom();
		});

		await scrollToBottom();
	});

	async function sendMessage() {
		const newMessage: Message = {
			content: currentMessage,
			type: 'chat',
			id: 0,
			created_at: Date.now()
		};
		if (socket && currentMessage != '') socket.send(newMessage);
		currentMessage = '';
	}

	const openMediaDevices = async (constraints: MediaStreamConstraints) => {
		return await navigator.mediaDevices.getUserMedia(constraints);
	}

	async function getConnectedDevices(type: string) {
		const devices = await navigator.mediaDevices.enumerateDevices();
		return devices.filter(device => device.kind === type)
	}

	async function openCamera(cameraId: string, minWidth: number, minHeight: number) {
		const constraints: MediaStreamConstraints ={
			'audio': {'echoCancellation': true},
			'video': {
				'deviceId': cameraId,
				'width': {'min': minWidth},
				'height': {'min': minHeight}
				}
			}
    	return await navigator.mediaDevices.getUserMedia(constraints);
	}

	async function audioCall() {
		try {
			const stream = await openMediaDevices({'audio':true});
		} catch(error) {
			console.error('Error accessing media devices.', error);
			const t: ToastSettings = {
					message: 'Cannot access to the microphone',
					background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			return;
		}
		const devices = await getConnectedDevices('audioinput');
		if (devices.length === 0) {
			const t: ToastSettings = {
					message: 'No audio input devices found',
					background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			return;
		}
	}

	async function videoCall() {
		try {
			const stream = await openMediaDevices({'audio':true, 'video':true});
		} catch(error) {
			console.error('Error accessing media devices.', error);
			const t: ToastSettings = {
					message: 'Cannot access to the media devices',
					background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			return;
		}
		is_videoCall = true;
		const devices = await getConnectedDevices('videoinput');
		console.log("devices: ", devices);
		if (devices && devices.length > 0) {
			if (devices[0]) {
				try {
					const stream = await openCamera(devices[0].deviceId, 100, 100);
					const videoElement = document.querySelector('video#localVideo');
					if (videoElement instanceof HTMLVideoElement) {
						videoElement.srcObject = stream;
					} else {
						console.error('Video element not found or is not a valid HTMLVideoElement.');
						return;
					}
				} catch (error) {
					console.error('Error opening camera:', error);
					const t: ToastSettings = {
						message: 'Failed to access the camera',
						background: 'variant-filled-error'
					};
					toastStore.trigger(t);
					return;
				}
			} else {
				const t: ToastSettings = {
					message: 'No video input devices found',
					background: 'variant-filled-error'
				};
				toastStore.trigger(t);
				return;
			}
			const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
			const peerConnection = new RTCPeerConnection(configuration);
			const offer = await peerConnection.createOffer();
			await peerConnection.setLocalDescription(offer);
			const newMessage: Message = {
				type: 'Call_offer',
				call_content: offer,
				id: 0,
				created_at: Date.now()
			};
			if (socket && newMessage.call_content != undefined) socket.send(newMessage);
		}
	}

	async function scrollToBottom() {
		await tick();
		chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
	}

	function handleScroll() {
		// const { scrollTop, scrollHeight, clientHeight } = chatContainer;
		// if (scrollHeight <= clientHeight || scrollTop <= scrollHeight / 2) {
		// 	if (messages.length > 0) {
		// 		console.log(messages[0].id);
		// 		socket.send({
		// 			type: 'history',
		// 			chat_id: messages[0].id
		// 		});
		// 	}
		// }
	}

	function onPromptKeydown(event: KeyboardEvent): void {
		if (event.code === 'Enter' && event.shiftKey) {
			event.preventDefault();
			currentMessage += '\n';
		} else if (event.code === 'Enter') {
			event.preventDefault();
			sendMessage();
			textarea.style.height = 'fit-content';
		}
	}

	function resizeTextarea() {
		textarea.style.height = 'fit-content';
		const maxHeight = 6 * parseFloat(getComputedStyle(textarea).lineHeight || '20');
		textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
	}
</script>

<main class="h-[92vh] flex flex-col">
	<header class="h-fit p-4 flex items-center justify-center relative">
		<a href="/chat" class="md:hidden absolute top-1/2 -translate-y-1/2 left-[10px]">
			<Icon icon="ic:round-arrow-back" width="24" height="24" />
		</a>
		{#if chat}
			<h2 class="h2">{chat.name}</h2>
		{/if}
	</header>
	{#if is_videoCall}
		<div class="h-full w-full">
			<video id="localVideo" autoplay playsinline></video>
		</div>
	{/if}
	{#if is_audioCall}
		<div class="h-full w-full">
			<audio id="localAudio" autoplay playsinline></audio>
		</div>
	{/if}
	<section class="h-full overflow-y-auto" bind:this={chatContainer} on:scroll={handleScroll}>
		<ul class="size-full p-10 flex flex-col gap-2.5">
			{#each messages as message}
				{#if message.type == 'announce'}
					<Announce {message} />
				{:else}
					<Chat
						{message}
						classes={classes[message.author?.id === data.user?.id ? 'personal' : 'other']}
					/>
				{/if}
			{/each}
		</ul>
	</section>
	<div class="h-fit p-4">
		<form
			class="input-group input-group-divider grid-cols-[auto_1fr_auto] rounded-container-token"
			on:submit|preventDefault={sendMessage}
		>
			{#if !showCallMenu}
				<button class="input-group-shim" on:click={() => {toggleCallMenu()}}>+</button>
			{/if}
			{#if showCallMenu}
				<div class="bg-transparent border-0 flex" on:mouseleave={() => {toggleCallMenu()}}>

					<button
					type="button"
					class="input-group-shim bg-transparent"
					on:click={audioCall}
					aria-label="Audio call"
					title="Audio call"
					>
					<Icon icon="ic:round-call" width="24" height="24" />
					</button>
					<button
					type="button"
					class="input-group-shim bg-transparent"
					on:click={videoCall}
					aria-label="Video call"
					title="Video call"
					>
					<Icon icon="ic:round-videocam" width="24" height="24" />
					</button>
				</div>
			{/if}
			<textarea
				bind:value={currentMessage}
				class="bg-transparent border-0 ring-0 p-2 h-fit"
				name="prompt"
				id="prompt"
				placeholder="Write a message..."
				rows="1"
				on:keydown={onPromptKeydown}
				on:input={resizeTextarea}
				bind:this={textarea}
			/>
			<button class="variant-filled-primary" type="submit">Send</button>
		</form>
	</div>
</main>
