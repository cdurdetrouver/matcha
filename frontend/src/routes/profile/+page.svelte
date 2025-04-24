<script lang="ts">
    import type { User } from '$lib/types/user';
    import type { Image } from '$lib/types/image';
	import { goto } from '$app/navigation';
	import { logoutUser, request } from '$lib/script/request';
	import { onMount } from 'svelte';
    import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';

	const toastStore = getToastStore();

	export let data;

    const user = data.user as User;
    let images :Image[] = [];
    console.log(user);

    onMount(async () => {
        const res = await request('/api/user/image/' + user.id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (!res.ok) {
            const t: ToastSettings = {
				message: 'Failed to load user image',
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
            goto('/');
        }
        const data = await res.json();
        images = data.images;
    })


	async function logout() {
		await logoutUser();
		goto('/');
	}
</script>

<div class="size-full flex flex-col items-center justify-center gap-5">
	{#if user?.complete_profile == false}
		<a href="/complete" class="btn variant-filled">Complete your profile</a>
	{:else if user}
		<p>{user.username}</p>
        <img src={user.avatar?.link} alt="Avatar" class="rounded-full w-24 h-24" />
        <p>{user.description}</p>
        <p>connected : {user.online}</p>
        <p>{user.wanted}</p>
        {#each images as image}
            <img src={image.link} alt="Image" class="rounded-full w-24 h-24"/>
        {/each}
	{/if}
	<form on:submit|preventDefault={logout}>
		<button class="btn variant-filled-primary mx-10 px-10" type="submit">Logout</button>
	</form>
</div>
