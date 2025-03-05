<script lang="ts">
	import HomeHero from '$lib/components/Home/Hero.svelte';
	import HomePlayground from '$lib/components/Home/Playground.svelte';
	import Footer from '$lib/components/Home/Footer.svelte';
</script>

<header id="hero" class="bg-surface-100-800-token hero-gradient">
	<div class="section-container"><HomeHero /></div>
</header>

<section id="playground" class="bg-surface-100-800-token">
	<div class="section-container"><HomePlayground /></div>
</section>

<Footer /> 

<style type="postcss">
	.section-container {
		@apply w-full max-w-7xl mx-auto p-4 py-16 md:py-24;
	}

	.hero-gradient {
		background-image:
			radial-gradient(at 0% 0%, rgba(var(--color-secondary-500) / 0.33) 0px, transparent 50%),
			radial-gradient(at 98% 1%, rgba(var(--color-error-500) / 0.33) 0px, transparent 50%);
	}
</style>
