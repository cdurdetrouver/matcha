<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';

	export let feeds: string[];

	onMount(async () => {
		let tinderContainer = document.querySelector('.tinder');
		let allCards = document.querySelectorAll('.tinder--card');

		console.log(allCards.length);
		let friend = document.getElementById('friend');
		let love = document.getElementById('love');

		function initCards() {
			var newCards = document.querySelectorAll(
				'.tinder--card:not(.removed)'
			) as NodeListOf<HTMLElement>;

			newCards.forEach(function (card, index) {
				card.style.zIndex = String(allCards.length - index);
				card.style.transform = 'scale(' + (20 - index) / 20 + ') translateY(-' + 30 * index + 'px)';
				card.style.opacity = String((10 - index) / 10);
			});

			tinderContainer?.classList.add('loaded');
		}

		initCards();

		allCards.forEach(function (el) {
			var hammertime = new Hammer(el);

			hammertime.on('pan', function (event) {
				el.classList.add('moving');
			});

			hammertime.on('pan', function (event) {
				if (event.deltaX === 0) return;
				if (event.center.x === 0 && event.center.y === 0) return;

				tinderContainer?.classList.toggle('tinder_love', event.deltaX > 0);
				tinderContainer?.classList.toggle('tinder_friend', event.deltaX < 0);

				var xMulti = event.deltaX * 0.03;
				var yMulti = event.deltaY / 80;
				var rotate = xMulti * yMulti;

				event.target.style.transform =
					'translate(' + event.deltaX + 'px, ' + event.deltaY + 'px) rotate(' + rotate + 'deg)';
			});

			hammertime.on('panend', function (event) {
				el.classList.remove('moving');
				tinderContainer?.classList.remove('tinder_love');
				tinderContainer?.classList.remove('tinder_friend');

				var moveOutWidth = document.body.clientWidth;
				var keep = Math.abs(event.deltaX) < 80 || Math.abs(event.velocityX) < 0.5;

				event.target.classList.toggle('removed', !keep);

				if (keep) {
					event.target.style.transform = '';
				} else {
					var endX = Math.max(Math.abs(event.velocityX) * moveOutWidth, moveOutWidth);
					var toX = event.deltaX > 0 ? endX : -endX;
					var endY = Math.abs(event.velocityY) * moveOutWidth;
					var toY = event.deltaY > 0 ? endY : -endY;
					var xMulti = event.deltaX * 0.03;
					var yMulti = event.deltaY / 80;
					var rotate = xMulti * yMulti;

					event.target.style.transform =
						'translate(' + toX + 'px, ' + (toY + event.deltaY) + 'px) rotate(' + rotate + 'deg)';
					initCards();
				}
			});
		});

		function createButtonListener(love: boolean) {
			return function (event: HTMLElementEventMap['click']) {
				var cards = document.querySelectorAll('.tinder--card:not(.removed)');
				var moveOutWidth = document.body.clientWidth * 1.5;

				if (!cards.length) return false;

				var card = cards[0] as HTMLElement;

				card.classList.add('removed');

				if (love) {
					card.style.transform = 'translate(' + moveOutWidth + 'px, -100px) rotate(-30deg)';
				} else {
					card.style.transform = 'translate(-' + moveOutWidth + 'px, -100px) rotate(30deg)';
				}

				initCards();

				event.preventDefault();
			};
		}

		var friendListener = createButtonListener(false);
		var loveListener = createButtonListener(true);

		friend?.addEventListener('click', friendListener);
		love?.addEventListener('click', loveListener);
	});
</script>

<svelte:head>
	<script async src="https://hammerjs.github.io/dist/hammer.min.js"></script>
</svelte:head>

<div class="tinder scrollbar-none size-full snap-y snap-mandatory overflow-y-scroll">
	{#each feeds as feed}
		<div class="snap-start size-full flex items-center justify-center">
			<div
				class="tinder--card bg-black size-full md:h-[90%] md:w-[30%] relative overflow-hidden rounded-3xl shadow-2xl"
			>
				<div class="absolute size-full flex items-center justify-center">
					<img class="size-full object-contain" src="/blast.jpg" alt="test" />
				</div>
				<div class="absolute size-full flex items-end flex-col justify-end p-10">
					<a href="/user/1" class="z-[10]">
						<Avatar
							src="/blast.jpg"
							border="border-4 border-surface-300-600-token hover:!border-primary-500"
							cursor="cursor-pointer"
						/>
					</a>
				</div>
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
		will-change: transform;
		transition: all 0.3s ease-in-out;
	}

	.moving.tinder--card {
		transition: none;
		cursor: -webkit-grabbing;
		cursor: -moz-grabbing;
		cursor: grabbing;
	}

	.z-context {
		z-index: 100;
	}
</style>
