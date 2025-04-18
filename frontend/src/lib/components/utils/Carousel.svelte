<script lang="ts">
	import type { Image } from '$lib/types/image';
	import Icon from '@iconify/svelte';

	let elemCarousel: HTMLDivElement;
	export let images: Image[];

	function carouselLeft(): void {
		console.log('left');
		const x =
			elemCarousel.scrollLeft === 0
				? elemCarousel.clientWidth * elemCarousel.childElementCount
				: elemCarousel.scrollLeft - elemCarousel.clientWidth;
		elemCarousel.scroll(x, 0);
	}

	function carouselRight(): void {
		console.log('right');
		const x =
			elemCarousel.scrollLeft === elemCarousel.scrollWidth - elemCarousel.clientWidth
				? 0
				: elemCarousel.scrollLeft + elemCarousel.clientWidth;
		elemCarousel.scroll(x, 0);
	}
</script>

<div class="relative size-full flex items-center justify-center">
	<div bind:this={elemCarousel} class="snap-x snap-mandatory scroll-smooth flex overflow-x-auto">
		{#each images as image}
			<img
				class="snap-center w-[1024px] rounded-container-token"
				src={image.link}
				alt={image.filename}
				loading="lazy"
			/>
		{/each}
	</div>
	<button
		type="button"
		class="btn-icon variant-filled absolute left-4 top-1/2 transform -translate-y-1/2 z-10"
		on:click={carouselLeft}
	>
		<Icon icon="maki:arrow" style="transform : rotate(180deg);" />
	</button>
	<button
		type="button"
		class="btn-icon variant-filled absolute right-4 top-1/2 transform -translate-y-1/2 z-10"
		on:click={carouselRight}
	>
		<Icon icon="maki:arrow" />
	</button>
</div>
