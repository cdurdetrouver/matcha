<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { request } from '$lib/script/request';
	import { onMount } from 'svelte';
	import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';

	const toastStore = getToastStore();

	let new_password = '';
	let confirm_password = '';
	let pass_error = '';

	let token: string | null = null;

	onMount(async () => {
		token = page.url.searchParams.get('token');

		if (!token) goto('/login');
	});

	async function update_pass(e: Event) {
		e.preventDefault();
		if (new_password !== confirm_password) {
			console.log(new_password, confirm_password);
			pass_error = 'Passwords do not match';
			return;
		}

		const res = await request('/api/user/update_pass', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				token,
				new_password
			})
		});

		const data = await res.json();
		if (res.status !== 200) {
			const t: ToastSettings = {
				message: data.message,
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			return;
		}

		const t: ToastSettings = {
			message: 'You have successfully change your password',
			background: 'variant-filled-success'
		};
		toastStore.trigger(t);
	}
</script>

<div class="size-full flex items-center justify-center">
	<div class="w-[60vw] h-[75vh] flex flex-col items-center justify-center text-center gap-5">
		<form on:submit|preventDefault={update_pass} class="flex flex-col gap-5" novalidate>
			<label>
				New password
				<input
					type="password"
					name="password"
					placeholder="New password"
					class="input p-2"
					required
					bind:value={new_password}
				/>
			</label>
			<label>
				Confirm password
				<input
					type="password"
					name="confirm_password"
					placeholder="Confirm password"
					class="input p-2"
					required
					bind:value={confirm_password}
				/>
			</label>
			{#if pass_error !== ''}
				<p class="text-red-500">{pass_error}</p>
			{/if}
			<button type="submit" class="btn variant-filled">Change password</button>
		</form>
	</div>
</div>
