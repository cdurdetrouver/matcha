<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	onMount(() => {
		const token = page.url.searchParams.get('token');
		const userid = page.url.searchParams.get('userid');

		if (!token || !userid) goto('/login');
	});
</script>

<div class="size-full flex items-center justify-center">
	<div class="w-[60vw] h-[75vh] flex flex-col items-center justify-center text-center gap-5">
		<h2 class="h1">You have successfully check your email 🎉</h2>
		<p>You can now complete your profile</p>
		<a href="/complete" class="btn variant-filled">Complete</a>
	</div>
</div>
