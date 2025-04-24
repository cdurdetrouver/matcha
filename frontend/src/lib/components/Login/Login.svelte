<script lang="ts">
	import { goto } from '$app/navigation';
	import { PUBLIC_BACKEND_HOST } from '$env/static/public';
	import { SetCookie } from '$lib/script/cookies';
	import type { User } from '$lib/types/user';
	import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';

	const toastStore = getToastStore();

	let form: {
		missing_email?: boolean;
		missing_password?: boolean;
		incorrect_email?: boolean;
		incorrect_password?: boolean;
		email?: string;
	} = {};

	let email = form?.email || '';
	let password = '';

	async function login(event: SubmitEvent) {
		event.preventDefault();

		if (!email || !password) {
			form = {
				missing_email: !email,
				missing_password: !password,
				email
			};
		}

		const res = await fetch(`${PUBLIC_BACKEND_HOST}/api/user/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email: email,
				password: password
			}),
			credentials: 'include'
		});
		const data_res = await res.json();
		if (res.status !== 200) {
			if (data_res.message) {
				const t: ToastSettings = {
					message: data_res.message,
					background: 'variant-filled-error'
				};
				toastStore.trigger(t);
			}
			form = {
				incorrect_email: data_res.err_email,
				incorrect_password: data_res.err_password
			};
			return;
		}

		const user = data_res.user as User;

		SetCookie('user', JSON.stringify(user), 60 * 60 * 24 * 365);

		const t: ToastSettings = {
			message: "You're logged in 🎉",
			background: 'variant-filled-success'
		};
		toastStore.trigger(t);

		goto('/profile');
	}
</script>

<main class="flex flex-col gap-4">
	<form class="flex flex-col gap-2 items-start" on:submit={login}>
		<div class="w-full">
			<h2>Email:</h2>
			<input
				class="input w-2/3 px-2"
				type="email"
				name="email"
				placeholder="Email..."
				bind:value={email}
			/>
			{#if form?.missing_email}<p class="text-red-600">The email field is required</p>{/if}
			{#if form?.incorrect_email}<p class="text-red-600">The email field is incorrect</p>{/if}
		</div>
		<div class="w-full">
			<h2>Password:</h2>
			<input
				class="input w-2/3 px-2"
				type="password"
				name="password"
				placeholder="Password..."
				bind:value={password}
			/>
			{#if form?.missing_password}<p class="text-red-600">Password is required</p>{/if}
			{#if form?.incorrect_password}<p class="text-red-600">Password is incorrect !</p>{/if}
		</div>
		<button class="btn variant-filled-primary mx-10 px-10" type="submit">Login</button>
	</form>
	<hr />
	<div class="flex flex-col gap-3 items-center">
		<a href="test" class="btn bg-black text-white mx-20 flex gap-4"
			><img class="h-[1em]" src="logo/42Paris.svg" alt="42 paris logo" />Login with Intra</a
		>
		<a href="test" class="btn bg-white text-black mx-20 flex gap-4"
			><img class="h-[1em]" src="logo/Google.svg" alt="Google logo" />Login with Google</a
		>
	</div>
</main>
