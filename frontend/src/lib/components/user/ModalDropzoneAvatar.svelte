<script lang="ts">
	import type { SvelteComponent } from 'svelte';
	import { FileDropzone, RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
	import Icon from '@iconify/svelte';
	import { getModalStore } from '@skeletonlabs/skeleton';

	const modalStore = getModalStore();

	let selectedFiles: FileList | undefined = undefined;
	let source: string = 'file';
	let username: string = '';

	export let parent: SvelteComponent;

	function onFormSubmit(): void {
		if ($modalStore[0].response)
			$modalStore[0].response({ files: selectedFiles, source, username });
		modalStore.close();
	}
</script>

{#if $modalStore[0]}
	<div class="modal-example-form card p-4 w-modal shadow-xl space-y-4">
		<header class="text-2xl font-bold">{$modalStore[0].title ?? '(title missing)'}</header>
		<article>{$modalStore[0].body ?? '(body missing)'}</article>
		<!-- Enable for debugging: -->
		<RadioGroup class="w-full uppercase">
			<RadioItem bind:group={source} name="justify" value={'file'}>
				<p>File</p>
			</RadioItem>
			<RadioItem bind:group={source} name="justify" value={'x'}>
				<p>X</p>
			</RadioItem>
			<RadioItem bind:group={source} name="justify" value={'github'}>
				<p>Github</p>
			</RadioItem>
		</RadioGroup>
		<div class="p-4">
			{#if source == 'file'}
				{#if selectedFiles}
					<div
						class="relative rounded-2xl overflow-hidden flex items-center justify-center bg-black group size-full aspect-[0.75]"
					>
						<img
							src={URL.createObjectURL(selectedFiles[0])}
							alt="Preview"
							class="size-full object-contain absolute top-0 left-0"
						/>
						<button
							class="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
							on:click={() => (selectedFiles = undefined)}
						>
							<Icon icon="mdi:trash-can" width="1.5em" />
						</button>
					</div>
				{:else}
					<FileDropzone
						name="file"
						accept="image/*"
						bind:files={selectedFiles}
						class="size-full aspect-[0.75]"
					>
						<svelte:fragment slot="lead">
							<i class="flex items-center justify-center">
								<Icon icon="bx:file" width="2em" />
							</i>
						</svelte:fragment>
						<svelte:fragment slot="message"
							>Drag and drop an image or click to select.</svelte:fragment
						>
						<svelte:fragment slot="meta">PNG, JPG, and GIF formats are allowed.</svelte:fragment>
					</FileDropzone>
				{/if}
			{:else if source != 'file'}
				<input
					class="input w-2/3 p-2"
					type="text"
					name="username"
					placeholder="Username..."
					bind:value={username}
				/>
			{/if}
		</div>
		<!-- prettier-ignore -->
		<footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
			<button class="btn {parent.buttonPositive}" on:click={onFormSubmit}>{parent.buttonTextSubmit}</button>
		</footer>
	</div>
{/if}
