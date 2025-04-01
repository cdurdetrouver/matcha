<script lang="ts">
	import { goto } from "$app/navigation";
	import { PUBLIC_BACKEND_HOST } from "$env/static/public";

	let message:string = "";

	async function logout() {
		const res = await fetch(`${PUBLIC_BACKEND_HOST}/api/user/refresh_token`, {
			method: "GET",
			credentials: "include"
		});
		if (res.status !== 200) {
			const data_res = await res.json();
			message = data_res.message;
			return;
		}
		goto("/");
	};
</script>

<div class="size-full flex items-center justify-center">
	<form on:submit|preventDefault={logout}>
		<button class="btn variant-filled-primary mx-10 px-10" type="submit">Refresh</button>
	</form>
	{#if message}
		<h1>{message}</h1>
	{/if}
</div>
