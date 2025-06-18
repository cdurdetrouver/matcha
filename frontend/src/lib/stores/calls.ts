import type { WebSocketManager } from "$lib/script/request";
import { writable } from 'svelte/store';

export type CallState = {
	is_Call: 0 | 1 | 2; // 0 = no call, 1 = audio, 2 = video
	stream: MediaStream | undefined;
	socket: WebSocketManager | undefined;
	peerConnection: RTCPeerConnection | undefined;
	caller_id: number | undefined;
	target_id: number | undefined;
	chat_id: number | undefined;
	answer: number; // 0 = nothing, 1 = sent, 2 = received
	pendingCandidates: RTCIceCandidateInit[];
};

export const defaultCallState: CallState = {
	is_Call: 0,
	stream: undefined,
	socket: undefined,
	peerConnection: undefined,
	caller_id: undefined,
	target_id: undefined,
	chat_id: undefined,
	pendingCandidates: [],
	answer: 0
};

export const CallStore = writable<CallState>(defaultCallState);