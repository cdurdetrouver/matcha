<script lang="ts">
    import Icon from '@iconify/svelte';
</script>

<div
	class="card variant-soft-primary p-4 md:py-10 max-w-5xl mx-auto text-center flex flex-col md:flex-row justify-center items-center gap-4"
>
	<p class="!text-xl">Start your journey right now.</p>
	<a
		class="btn variant-filled"
		href="https://stackblitz.com/fork/github/skeletonlabs/repl/tree/main/welcome"
		target="_blank"
		rel="noreferrer"
	>
		<i class="fa-solid fa-bolt"></i>
		<span class="flex gap-3 items-center justify-center">Create Your Account <Icon icon="mdi:account" width="24" height="24" /></span>
	</a>
</div>