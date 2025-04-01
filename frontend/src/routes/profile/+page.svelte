<script lang="ts">
	import { goto } from '$app/navigation';
	import { logoutUser } from '$lib/script/request';

	let message: string = '';

	async function logout() {
		await logoutUser();
		goto('/');
	}
</script>

<div class="size-full flex items-center justify-center">
	<form on:submit|preventDefault={logout}>
		<button class="btn variant-filled-primary mx-10 px-10" type="submit">Logout</button>
	</form>
	{#if message}
		<h1>{message}</h1>
	{/if}
</div>
