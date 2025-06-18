import { CallStore, defaultCallState, type CallState } from '$lib/stores/calls';
import { get } from 'svelte/store';
import { request } from './request';

const AUDIO_CONSTRAINTS = {
		autoGainControl: false,
		echoCancellation: true,
		noiseSuppression: true,
		sampleRate: 48000,
		sampleSize: 16,
		channelCount: 2,
};

async function getIceServers(): Promise<RTCConfiguration> {
	const req = request(
		'/api/chat/ice_servers',
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		}
	);
	const response = await req;
	if (!response.ok) {
		throw new Error('Failed to fetch ICE servers: ' + response.statusText);
	}
	const data = await response.json();
	return data as RTCConfiguration;
}

async function openMediaDevices(constraints: MediaStreamConstraints): Promise<MediaStream> {
	return await navigator.mediaDevices.getUserMedia(constraints);
}

export async function Call(video:boolean): Promise<void> {
	let state = await get(CallStore);
	let stream: MediaStream;
	// Check if already in a call
	if (state.is_Call !== 0)
		throw new Error('Already in a call');
	await CallStore.set(defaultCallState);
	try {
		stream = await openMediaDevices({ video: video, audio: AUDIO_CONSTRAINTS});
		await CallStore.update((s: CallState) => {
			s.stream = stream;
			s.is_Call = 2;
			return s;
		});
		const videoElement = document.querySelector('video#localVideo');
		if (videoElement instanceof HTMLVideoElement) {
			videoElement.srcObject = stream;
			videoElement.muted = true;
		}
		else {
			console.error('Video element not found or is not a valid HTMLVideoElement.', videoElement);
			return;
		}
	} catch (error) {
		endCall();
		throw new Error('Failed to access the camera: ' + error);
	}
	//create the peer connection
	const config = await getIceServers();
	if (!config)
		throw new Error('No ICE servers available');
	//console.log('Using ICE servers:', config);
	const pc = new RTCPeerConnection(config);
	//add the local stream to the peer connection

	pc.ontrack = (event: RTCTrackEvent) => {
		const remoteVideo = document.querySelector('video#remoteVideo');
			if (remoteVideo instanceof HTMLVideoElement) {
				remoteVideo.srcObject = event.streams[0];
			}
			else
				throw new Error('Video element not found or is not a valid HTMLVideoElement.');
	};
	//adding a trigger for when the remote client sends a stream
	pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
		const s = get(CallStore);
		if (event.candidate) {
			state.socket.send({
				type: 'IceCandidate',
				candidate: event.candidate,
				target_chat: s.chat_id,
				caller_id: s.caller_id
			});
		}
	};

	//creating the offer
	stream.getTracks().forEach((track: MediaStreamTrack) => {
		pc.addTrack(track, stream);
	});
	const offer = await pc.createOffer();
	await pc.setLocalDescription(offer);
	//sending it to the other client
	state = await get(CallStore);
	state.socket!.send({
		type: 'callOffer',
		offer: offer,
		target_chat: state.chat_id,
		caller_id: state.caller_id,
		video: video,
	});
	const ice_state = get(CallStore);
	try {
		for (const candidate of ice_state.pendingCandidates)
			await pc.addIceCandidate(candidate);
	} catch (error) {
			console.error('Failed to add pending ICE:', error);
	}
	state.pendingCandidates = []; // Clear pending candidates after adding them
	await CallStore.update((s: CallState) => {
		s.peerConnection = pc;
		s.target_id = state.caller_id; // Set target ID to caller ID
		s.pendingCandidates = []; // Clear pending candidates
		return s;
	});
	return;
}

export async function acceptCall(
		offer: RTCSessionDescriptionInit, 
		video: boolean,
		caller_id: number
	): Promise<void> {
	let state:CallState = await get(CallStore);
	let stream: MediaStream;
	if (state.is_Call !== 0)
		throw new Error('Already in a call');
	await CallStore.set(defaultCallState);
	try {
		stream = await openMediaDevices({ video: video, audio: AUDIO_CONSTRAINTS });
		await CallStore.update((s: CallState) => {
			s.stream = stream;
			s.is_Call = 2;
			s.caller_id = caller_id;
			return s;
		});
		if (video) {
			const videoElement = document.querySelector('video#localVideo');
			if (videoElement instanceof HTMLVideoElement) {
				videoElement.srcObject = stream;
				videoElement.muted = true;
			}
			else
				throw new Error('Video element not found or is not a valid HTMLVideoElement.');
		}
	} catch (error) {
		throw new Error('Failed to access the camera: ' + error);
	}
	const config = await getIceServers();
	if (!config)
		throw new Error('No ICE servers available');
	const pc = new RTCPeerConnection(config);
	await CallStore.update((s: CallState) => {
		s.peerConnection = state.peerConnection;
		return s;
	});

	stream.getTracks().forEach((track: MediaStreamTrack) => {
		pc.addTrack(track, stream);
	});
	
	pc.ontrack = (event: RTCTrackEvent) => {
		const remoteVideo = document.querySelector('video#remoteVideo');
		if (remoteVideo instanceof HTMLVideoElement)
			remoteVideo.srcObject = event.streams[0];
		else
			throw new Error('Video element not found or is not a valid HTMLVideoElement.');
	};

	await pc.setRemoteDescription(new RTCSessionDescription(offer));

	pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
		const s = get(CallStore);
		if (event.candidate) {
			state.socket!.send({
				type: 'IceCandidate',
				candidate: event.candidate,
				target_id: caller_id,
			});
		}
	};
	const answer = await pc.createAnswer();
	answer.sdp = answer.sdp?.replace(
		'useinbandfec=1',
		'useinbandfec=1; stereo=1; maxaveragebitrate=510000; sprop-stereo=1; cbr=1; ptime=20'
	);
	await pc.setLocalDescription(answer);
	state = await get(CallStore);
	state.socket!.send({
		type: 'callAnswer',
		answer: answer,
		target_id: caller_id,
		target_chat: state.chat_id
	});
	for (const candidate of state.pendingCandidates) {
		try {
			await pc.addIceCandidate(candidate);
		} catch (error) {
			console.error('Failed to add pending ICE candidate:', error);
		}
	}
	state.pendingCandidates = [];
	await CallStore.update((s: CallState) => {
		s.peerConnection = pc;
		s.target_id = caller_id;
		s.answer = 1;
		return s;
	});
	return;
}

export async function endCall(received?: boolean): Promise<void> {
	const state = await get(CallStore);
	if (state.is_Call === 0)
		throw new Error('No active call to end');
	if (!received) {
		let target_id = 0;
		if (state.answer === 1) 
			target_id = state.caller_id;
		state.socket.send({
			type: 'endCall',
			target_chat: state.chat_id,
			caller_id: state.caller_id,
			target_id: target_id
		});
	}
	if (state.peerConnection) {
		state.peerConnection.ontrack = null;
		state.peerConnection.onicecandidate = null;
		state.peerConnection.oniceconnectionstatechange = null;
		state.peerConnection.close();
		state.peerConnection = undefined;
	}
	if (state.stream) {
		state.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
		state.stream = undefined;
	}
	const localVideoElement = document.querySelector('video#localVideo');
	if (localVideoElement instanceof HTMLVideoElement)
		localVideoElement.srcObject = null;
	const remoteVideoElement = document.querySelector('video#remoteVideo');
	if (remoteVideoElement instanceof HTMLVideoElement)
		remoteVideoElement.srcObject = null;
	await CallStore.set({
		is_Call: 0,
		stream: undefined,
		socket: state.socket,
		peerConnection: undefined,
		target_id: undefined,
		pendingCandidates: [],
		answer: 0
	});
}
