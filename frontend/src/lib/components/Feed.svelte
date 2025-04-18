<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton';
	import Carousel from './utils/Carousel.svelte';

	export let feeds: { id: number; content: string }[];

	let Cards: NodeListOf<HTMLElement>;
	let PlaceHolders: NodeListOf<HTMLElement>;

	function initializeSwipeLogic() {
		if (typeof document === 'undefined') {
			return;
		}
		Cards = document.querySelectorAll('.tinder--card') as NodeListOf<HTMLElement>;
		PlaceHolders = document.querySelectorAll('.place-holder') as NodeListOf<HTMLElement>;

		Cards.forEach((card, index) => {
			const feed = feeds[index];
			const placeholder = PlaceHolders[index];
			const textelement = placeholder.querySelector('#text') as HTMLElement;
			const hammertime = new Hammer(card);

			card.classList.remove('moving');
			placeholder.classList.remove('friend');
			placeholder.classList.remove('love');

			hammertime.on('pan', function (ev) {
				ev.target.classList.add('moving');

				var xMulti = ev.deltaX * 0.03;
				var yMulti = ev.deltaY / 80;

				var rotate = xMulti + yMulti;

				ev.target.style.transform =
					'translate(-50%, -50%) translate(' +
					ev.deltaX +
					'px, ' +
					ev.deltaY +
					'px) rotate(' +
					rotate +
					'deg)';

				if (ev.deltaX > 0) {
					placeholder.classList.add('friend');
					placeholder.classList.remove('love');
					textelement.innerHTML = 'friend';
				} else if (ev.deltaX < 0) {
					placeholder.classList.add('love');
					placeholder.classList.remove('friend');
					textelement.innerHTML = 'love';
				}
			});

			hammertime.on('panend', function (ev) {
				ev.target.style.transform = 'translate(-50%, -50%)';
				ev.target.classList.remove('moving');
				placeholder.classList.remove('love');
				placeholder.classList.remove('friend');
			});

			hammertime.on('swipe', async function (ev) {
				console.log('delete post :', feed);

				feeds = feeds.filter((f) => f.id !== feed.id);
				feeds = [...feeds];

				console.log('feeds :', feeds);
			});
		});
	}

	$: if (feeds) {
		initializeSwipeLogic();
	}
</script>

<svelte:head>
	<script async src="https://hammerjs.github.io/dist/hammer.min.js"></script>
	<meta
		name="viewport"
		content="user-scalable=no, width=device-width, initial-scale=1, maximum-scale=1"
	/>
</svelte:head>

<div class="scrollbar-none size-full snap-y snap-mandatory overflow-y-scroll">
	{#each feeds as feed}
		<div class="relative snap-start size-full">
			<div
				class="tinder--card moving bg-black size-full md:h-[90%] xl:w-[30%] md:w-[40%] overflow-hidden rounded-3xl shadow-2xl select-none relative"
			>
				<div class="size-full select-none pointer-events-none">
					<Carousel
						images={[
							{ link: '/blast.jpg', filename: 'blast', id: 0, user_id: 1 },
							{ link: '/outerwilds.jpg', filename: 'outerwilds', id: 1, user_id: 1 }
						]}
					/>
				</div>
				<a href="/user/1" class="z-[10] absolute bottom-[5%] right-[5%]">
					<Avatar
						src="/blast.jpg"
						border="border-4 border-surface-300-600-token hover:!border-primary-500"
						cursor="cursor-pointer"
					/>
				</a>
			</div>
			<div
				class="place-holder friend love size-full md:h-[90%] xl:w-[30%] md:w-[40%] rounded-3xl shadow-2xl"
			>
				<h1 id="text" class="h1">Placeholder Text</h1>
			</div>
		</div>
	{/each}
</div>

<style lang="postcss">
	.tinder--card {
		cursor: -webkit-grab;
		cursor: -moz-grab;
		cursor: grab;
		position: absolute;
		transition: all 0.5s ease-in-out;
		will-change: transform;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		transform-style: preserve-3d;
	}

	.place-holder {
		display: none;
		justify-content: center;
		align-items: center;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		user-select: none;
		overflow: hidden;
		background-color: transparent;
		z-index: -1;
	}
	.friend {
		display: flex;
		background-color: #1e90ff;
	}

	.love {
		display: flex;
		background-color: #e32636;
	}

	.moving.tinder--card {
		cursor: -webkit-grabbing;
		cursor: -moz-grabbing;
		cursor: grabbing;
		transition: none;
	}
</style>
