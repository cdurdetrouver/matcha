<script lang="ts">
	import { onMount, type SvelteComponent } from 'svelte';
	import {
		Autocomplete,
		getModalStore,
		InputChip,
		type AutocompleteOption,
		type ToastSettings,
		getToastStore
	} from '@skeletonlabs/skeleton';
	import { request } from '$lib/script/request';
	import { goto } from '$app/navigation';

	const modalStore = getModalStore();
	const toastStore = getToastStore();

	export let parent: SvelteComponent;

	let tags: string[] = [];
	let TagOptions: AutocompleteOption<string>[] = [];
	let mytags: string[] = [];
	let tag: string = '';

	onMount(async () => {
		const res = await request('/api/tag/all', {
			method: 'GET',
			credentials: 'include'
		});

		if (!res.ok) {
			const t: ToastSettings = {
				message: 'Failed to fetch tags',
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			goto('/user/edit');
		}

		const data_tags = await res.json();

		if (data_tags) {
			TagOptions = data_tags.map((tag: string) => ({
				label: tag,
				value: tag
			}));
			tags = data_tags;
			mytags = $modalStore[0].meta ?? [];
		}
	});

	function onFormSubmit(): void {
		if ($modalStore[0].response) $modalStore[0].response(mytags);
		modalStore.close();
	}

	function onFlavorSelectionTag(event: CustomEvent<AutocompleteOption<string>>): void {
		if (mytags.includes(event.detail.label) === false) {
			mytags = [...mytags, event.detail.label];
			tag = '';
		}
	}

	function inputChipValidation(value: string): boolean {
		if (!tags.includes(value)) {
			return false;
		}
		return true;
	}

	async function createTag(): Promise<void> {
		if (tag && !mytags.includes(tag)) {
			const res = await request('/api/tag/create', {
				method: 'POST',
				body: JSON.stringify({ tag_name: tag }),
				credentials: 'include'
			});
			if (!res.ok) {
				const t: ToastSettings = {
					message: 'Failed to create tag',
					background: 'variant-filled-error'
				};
				toastStore.trigger(t);
				return;
			}
			const data = await res.json();
			mytags = [...mytags, tag];
			TagOptions = [...TagOptions, { label: tag, value: tag }];
			tag = '';
			tags = [...tags, data.tag_name];
		}
	}
</script>

{#if $modalStore[0]}
	<div class="modal-example-form card p-4 w-modal shadow-xl space-y-4">
		<header class="text-2xl font-bold">{$modalStore[0].title ?? '(title missing)'}</header>
		<article>{$modalStore[0].body ?? '(body missing)'}</article>
		<div class="p-4">
			<div class="flex items-center">
				<InputChip
					bind:input={tag}
					bind:value={mytags}
					name="chips"
					validation={inputChipValidation}
				/>
				<button
					class="variant-filled-secondary btn h-fit"
					disabled={tags.includes(tag) || tag === ''}
					on:click={createTag}
				>
					Create tag
				</button>
			</div>

			<div class="card w-full max-w-sm max-h-48 p-4 overflow-y-auto z-[100]" tabindex="-1">
				<Autocomplete
					bind:input={tag}
					options={TagOptions}
					on:selection={onFlavorSelectionTag}
					denylist={mytags}
				/>
			</div>
		</div>
		<!-- prettier-ignore -->
		<footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
			<button class="btn {parent.buttonPositive}" on:click={onFormSubmit}>{parent.buttonTextSubmit}</button>
		</footer>
	</div>
{/if}
