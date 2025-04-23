import type { Chat } from '$lib/types/chat';
import { writable } from 'svelte/store';

export const ChatsStore = writable<Chat[]>([]);
