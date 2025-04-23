<script lang="ts">
	import { goto } from '$app/navigation';
	import { logoutUser } from '$lib/script/request';

	export let data;

	async function logout() {
		await logoutUser();
		goto('/');
	}
</script>

<div class="size-full flex flex-col items-center justify-center gap-5">
	{#if data.user?.complete_profile == false}
		<a href="/complete" class="btn variant-filled">Complete your profile</a>
	{:else if data.user}
		<p>{data.user.username}</p>
	{/if}
	<form on:submit|preventDefault={logout}>
		<button class="btn variant-filled-primary mx-10 px-10" type="submit">Logout</button>
	</form>
</div>
