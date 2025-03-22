<script lang="ts">
	export let form;
</script>

<main class="flex flex-col gap-4">
	<form class="flex flex-col gap-2 items-start" method="POST" action="?/register">
		<div class="w-full">
			<h2>Email:</h2>
			<input
				class="input w-2/3 px-2"
				type="email"
				name="email"
				placeholder="Email..."
				value={form?.email ?? ''}
			/>
			{#if form?.missing_email}<p class="text-red-600">The email field is required</p>{/if}
			{#if form?.incorrect_email}<p class="text-red-600">The email field is incorrect</p>{/if}
		</div>
		<div class="w-full">
			<h2>Username:</h2>
			<input
				class="input w-2/3 px-2"
				type="text"
				name="username"
				placeholder="Username..."
				value={form?.username ?? ''}
			/>
			{#if form?.missing_username}<p class="text-red-600">The username field is required</p>{/if}
			{#if form?.incorrect_username}<p class="text-red-600">The username field is incorrect</p>{/if}
		</div>
		<div class="w-full">
			<h2>Password:</h2>
			<input class="input w-2/3 px-2" type="password" name="password" placeholder="Password..." />
			{#if form?.missing_password}<p class="text-red-600">The Password field is required</p>{/if}
			{#if form?.incorrect_password}<p class="text-red-600">{form?.password_message ?? ''}</p>{/if}
		</div>
		<div class="w-full">
			<h2>Confirm Password:</h2>
			<input
				class="input w-2/3 px-2"
				type="password"
				name="password-verif"
				placeholder="Password..."
			/>
			{#if form?.missing_match}<p class="text-red-600">Field is missing</p>{/if}
			{#if form?.incorrect_match}<p class="text-red-600">{form?.incorrect_match}</p>{/if}
		</div>
		<button class="btn variant-filled-primary mx-10 px-10" type="submit">Register</button>
	</form>
	<hr />
	<div class="flex flex-col gap-3 items-center">
		<a href="test" class="btn variant-filled mx-20 flex gap-4"
			><img class="h-[1em]" src="logo/42Paris.svg" alt="42 paris logo" />Register with Intra</a
		>
		<a href="test" class="btn bg-white mx-20 flex gap-4"
			><img class="h-[1em]" src="logo/Google.svg" alt="Google logo" />Register with Google</a
		>
	</div>
</main>
