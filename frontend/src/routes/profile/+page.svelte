<script lang="ts">
	import { goto } from '$app/navigation';
	import { logoutUser } from '$lib/script/request';

	export let data;

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
	{#if data.user.complete_profile == false}
		<a href="/complete" class="btn variant-filled">Complete your profile</a>
	{:else}
		<p>{data.user}</p>
	{/if}
</div>
	