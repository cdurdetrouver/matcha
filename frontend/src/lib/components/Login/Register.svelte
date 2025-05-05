<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		PUBLIC_BACKEND_HOST,
		PUBLIC_GOOGLE_ID,
		PUBLIC_GOOGLE_REDIRECT_URL,
		PUBLIC_INTRA_API_KEY,
		PUBLIC_INTRA_API_REDIRECT_URL
	} from '$env/static/public';
	import type { User } from '$lib/types/user';
	import {
		getModalStore,
		getToastStore,
		type ModalSettings,
		type ToastSettings
	} from '@skeletonlabs/skeleton';
	import { update_user } from '$lib/script/request';

	const modalStore = getModalStore();
	const toastStore = getToastStore();

	let form: {
		missing_username?: boolean;
		incorrect_username?: string;
		missing_match?: boolean;
		incorrect_match?: boolean;
		missing_email?: boolean;
		incorrect_email?: string;
		missing_password?: boolean;
		incorrect_password?: string;
		email?: string;
		username?: string;
		password?: string;
	} = {};

	let email = form?.email || '';
	let username = form?.username || '';
	let password = '';
	let match_password = '';

	async function register(event: SubmitEvent) {
		event.preventDefault();

		if (!email || !password || !username || !match_password) {
			form = {
				missing_email: !email,
				missing_password: !password,
				missing_username: !username,
				missing_match: !match_password,
				email,
				username
			};

			return;
		}

		if (password !== match_password) {
			form = {
				incorrect_match: true
			};

			return;
		}

		const res = await fetch(`${PUBLIC_BACKEND_HOST}/api/user/register`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email: email,
				password: password,
				username: username,
				match_password: match_password
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
				return;
			}
			form = {
				incorrect_email: data_res.err_email,
				incorrect_username: data_res.err_username,
				incorrect_password: data_res.err_password
			};
			return;
		}

		const user = data_res.user as User;

		// await update_user(user);

		const m: ModalSettings = {
			type: 'alert',
			title: 'You are now registered 🎉',
			body: 'Next step is to confirm your email !'
		};
		modalStore.trigger(m);

		goto('/complete');
	}
</script>

<main class="flex flex-col gap-4">
	<form class="flex flex-col gap-2 items-start" on:submit={register}>
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
			{#if form?.incorrect_email}<p class="text-red-600">{form?.incorrect_email}</p>{/if}
		</div>
		<div class="w-full">
			<h2>Username:</h2>
			<input
				class="input w-2/3 px-2"
				type="text"
				name="username"
				placeholder="Username..."
				bind:value={username}
			/>
			{#if form?.missing_username}<p class="text-red-600">The username field is required</p>{/if}
			{#if form?.incorrect_username}<p class="text-red-600">{form?.incorrect_username}</p>{/if}
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
			{#if form?.missing_password}<p class="text-red-600">The Password field is required</p>{/if}
			{#if form?.incorrect_password}<p class="text-red-600">{form?.incorrect_password}</p>{/if}
		</div>
		<div class="w-full">
			<h2>Confirm Password:</h2>
			<input
				class="input w-2/3 px-2"
				type="password"
				name="password-verif"
				placeholder="Password..."
				bind:value={match_password}
			/>
			{#if form?.missing_match}<p class="text-red-600">Field is missing</p>{/if}
			{#if form?.incorrect_match}<p class="text-red-600">Password Doesn't match</p>{/if}
		</div>
		<button class="btn variant-filled-primary mx-10 px-10" type="submit">Register</button>
	</form>
	<hr />
	<div class="flex flex-col gap-3 items-center">
		<a
			href="https://api.intra.42.fr/oauth/authorize?client_id={PUBLIC_INTRA_API_KEY}&redirect_uri={PUBLIC_INTRA_API_REDIRECT_URL}&response_type=code"
			class="btn bg-black text-white mx-20 flex gap-4"
			><img class="h-[1em]" src="logo/42Paris.svg" alt="42 paris logo" />Register with Intra</a
		>
		<a
			href="https://accounts.google.com/o/oauth2/auth?client_id={PUBLIC_GOOGLE_ID}&redirect_uri={PUBLIC_GOOGLE_REDIRECT_URL}?source=google&response_type=code&scope=openid%20email%20profile"
			class="btn bg-white text-black mx-20 flex gap-4"
			><img class="h-[1em]" src="logo/Google.svg" alt="Google logo" />Register with Google</a
		>
	</div>
</main>
