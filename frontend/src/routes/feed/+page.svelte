<script lang="ts">
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import type { Post } from '$lib/types/post.ts';
	import Feed from '$lib/components/Feed.svelte';
	import { onMount } from 'svelte';
	import { request } from '$lib/script/request';

	const toastStore = getToastStore();

	let feeds: Post[] = [];

	onMount(async () => {
		const res = await request('/api/posts', {
			method: 'GET',
			credentials: 'include'
		});

		if (!res.ok) {
			const t = {
				message: 'Failed to fetch posts',
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			goto('/login');
		}

		const data = await res.json();
		feeds = data.posts;
	});
</script>

<div class="size-full">
	<Feed {feeds} />
</div>
