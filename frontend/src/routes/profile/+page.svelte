<script lang="ts">
	import { goto } from "$app/navigation";
	import { PUBLIC_BACKEND_HOST } from "$env/static/public";
	import { DeleteCookie } from "$lib/script/cookies";

	let message:string = "";

	async function logout() {
		const res = await fetch(`${PUBLIC_BACKEND_HOST}/api/user/logout`, {
			method: "DELETE",
			credentials: "include"
		});
		if (res.status !== 200) {
			const data_res = await res.json();
			message = data_res.message;
			return;
		}
		DeleteCookie("user");
		goto("/");
	};
</script>

<div class="size-full flex items-center justify-center">
	<form on:submit|preventDefault={logout}>
		<button class="btn variant-filled-primary mx-10 px-10" type="submit">Logout</button>
	</form>
	{#if message}
		<h1>{message}</h1>
	{/if}
</div>
