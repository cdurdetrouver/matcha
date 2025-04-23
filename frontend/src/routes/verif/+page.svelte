<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { request } from '$lib/script/request';
	import { onMount } from 'svelte';
	import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';

	const toastStore = getToastStore();

	onMount(async () => {
		const token = page.url.searchParams.get('token');
		const userid = page.url.searchParams.get('userid');

		if (!token || !userid) goto('/login');

		const res = await request('/api/user/verif', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				token,
				userid
			})
		});

		if (res.status !== 200) {
			const data = await res.json();
			const t: ToastSettings = {
				message: data.message,
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			goto('/login');
		}
	});
</script>

<div class="size-full flex items-center justify-center">
	<div class="w-[60vw] h-[75vh] flex flex-col items-center justify-center text-center gap-5">
		<h2 class="h1">You have successfully check your email 🎉</h2>
		<p>You can now login</p>
		<a href="/login" class="btn variant-filled">Login</a>
	</div>
</div>
