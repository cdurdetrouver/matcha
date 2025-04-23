<script lang="ts">
	import { goto } from '$app/navigation';
	import { PUBLIC_BACKEND_HOST } from '$env/static/public';
	import { logoutUser } from '$lib/script/request';

	let message: string = '';
</script>

<div class="size-full flex items-center justify-center">
	<form on:submit|preventDefault={logoutUser}>
		<button class="btn variant-filled-primary mx-10 px-10" type="submit">Refresh</button>
	</form>
	{#if message}
		<h1>{message}</h1>
	{/if}
</div>
