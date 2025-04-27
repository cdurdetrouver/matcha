<script lang="ts">
	import type { SvelteComponent } from 'svelte';
	import {
		Autocomplete,
		getModalStore,
		InputChip,
		type AutocompleteOption
	} from '@skeletonlabs/skeleton';

	const modalStore = getModalStore();

	export let parent: SvelteComponent;

	console.log('ModalInterests', parent);

	let tags = ['basketball', 'soccer', 'tennis'];
	const TagOptions: AutocompleteOption<string>[] = [
		{ label: 'basketball', value: 'basketball' },
		{ label: 'soccer', value: 'soccer' },
		{ label: 'tennis', value: 'tennis' }
	];
	let mytags: string[] = $modalStore[0].meta ?? [];
	let tag: string;

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
</script>

{#if $modalStore[0]}
	<div class="modal-example-form card p-4 w-modal shadow-xl space-y-4">
		<header class="text-2xl font-bold">{$modalStore[0].title ?? '(title missing)'}</header>
		<article>{$modalStore[0].body ?? '(body missing)'}</article>
		<!-- Enable for debugging: -->
		<div class="p-4">
			<InputChip bind:input={tag} bind:value={mytags} name="chips" whitelist={tags} />

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
