<script lang="ts">
	import {
		RadioGroup,
		RadioItem,
		Autocomplete,
		popup,
		FileDropzone,
		Stepper,
		Step
	} from '@skeletonlabs/skeleton';
	import type { AutocompleteOption, PopupSettings } from '@skeletonlabs/skeleton';
	import Icon from '@iconify/svelte';

	const GenderOptions: AutocompleteOption<string>[] = [
		{ label: 'Male', value: 'male' },
		{ label: 'Female', value: 'female' },
		{ label: 'Non-binary', value: 'non-binary' },
		{ label: 'Genderqueer', value: 'genderqueer' },
		{ label: 'Genderfluid', value: 'genderfluid' },
		{ label: 'Agender', value: 'agender' },
		{ label: 'Other', value: 'other' }
	];

	let GenderpopupSettings: PopupSettings = {
		event: 'focus-click',
		target: 'GenderpopupAutocomplete',
		placement: 'bottom'
	};

	const SexualOptions: AutocompleteOption<string>[] = [
		{ label: 'Heterosexual', value: 'male' },
		{ label: 'Homosexual', value: 'female' },
		{ label: 'Bisexual', value: 'non-binary' },
		{ label: 'Asexual', value: 'genderqueer' },
		{ label: 'Pansexual', value: 'genderfluid' },
		{ label: 'Demisexual', value: 'agender' },
		{ label: 'Queer', value: 'other' },
		{ label: 'Polysexual', value: 'other' },
		{ label: 'Other', value: 'other' }
	];

	let SexualpopupSettings: PopupSettings = {
		event: 'focus-click',
		target: 'SexualpopupAutocomplete',
		placement: 'bottom'
	};

	let value: number = 1;
	let username: string = '';
	let inputGender = '';
	let inputSexual = '';
	let dropzoneFiles: (FileList | undefined)[] = Array(6).fill(undefined);

	function isValidOption(Options, input): boolean {
		return Options.some((option) => option.label === input);
	}

	async function complete() {
		alert(inputGender + value);
		if (!dropzoneFiles[0]) alert('Please select a profile picture.');
		for (let i = 0; i < dropzoneFiles.length; i++) {
			const file = dropzoneFiles[i];

			if (!file) {
				continue;
			}
			alert(file[0].name);
		}
	}

	function onFlavorSelectionGender(event: CustomEvent<AutocompleteOption<string>>): void {
		inputGender = event.detail.label;
	}

	function onFlavorSelectionSexual(event: CustomEvent<AutocompleteOption<string>>): void {
		inputSexual = event.detail.label;
	}
</script>

<main class="flex items-center justify-center size-full">
	<div class="card p-4 text-token">
		<Stepper on:complete={complete}>
			<Step locked={username.length < 3}>
				<svelte:fragment slot="header">Choose your username</svelte:fragment>
				<input class="input p-2" placeholder="Enter your username" bind:value={username} />
			</Step>
			<Step>
				<svelte:fragment slot="header">What's are you looking for ?</svelte:fragment>
				<RadioGroup class="w-full uppercase">
					<RadioItem bind:group={value} name="justify" value={0}>
						<div class="flex items-center justify-center gap-2">
							<Icon icon="mdi:heart" style="color: #1e90ff" width="1.5em" />
							<p>Friend</p>
						</div>
					</RadioItem>
					<RadioItem bind:group={value} name="justify" value={1}>
						<p>Both</p>
					</RadioItem>
					<RadioItem bind:group={value} name="justify" value={2}>
						<div class="flex items-center justify-center gap-2">
							<p>Love</p>
							<Icon icon="mdi:heart" style="color: #e32636" width="1.5em" />
						</div>
					</RadioItem>
				</RadioGroup>
			</Step>
			<Step locked={!isValidOption(GenderOptions, inputGender) && value > 0}>
				<svelte:fragment slot="header">What's your gender ?</svelte:fragment>
				<input
					class="input p-2"
					type="search"
					name="demo"
					bind:value={inputGender}
					placeholder="Search..."
					use:popup={GenderpopupSettings}
					disabled={value < 1}
				/>
				<div
					class="card w-full max-w-sm max-h-48 p-4 overflow-y-auto z-[100]"
					tabindex="-1"
					data-popup="GenderpopupAutocomplete"
				>
					<Autocomplete
						bind:input={inputGender}
						options={GenderOptions}
						on:selection={onFlavorSelectionGender}
					/>
				</div>
				{#if value == 0}
					<aside class="alert variant-ghost-warning">
						<div class="alert-message">
							<p>You should skip this step because you're not looking for some relationship</p>
						</div>
					</aside>
				{/if}
			</Step>
			<Step locked={!isValidOption(SexualOptions, inputSexual) && value > 0}>
				<svelte:fragment slot="header">What are you interrested for ?</svelte:fragment>
				<input
					class="input p-2"
					type="search"
					name="demo"
					bind:value={inputSexual}
					placeholder="Search..."
					use:popup={SexualpopupSettings}
					disabled={value < 1}
				/>
				<div
					class="card w-full max-w-sm max-h-48 p-4 overflow-y-auto z-[100]"
					tabindex="-1"
					data-popup="SexualpopupAutocomplete"
				>
					<Autocomplete
						bind:input={inputSexual}
						options={SexualOptions}
						on:selection={onFlavorSelectionSexual}
					/>
				</div>
				{#if value == 0}
					<aside class="alert variant-ghost-warning">
						<div class="alert-message">
							<p>You should skip this step because you're not looking for some relationship</p>
						</div>
					</aside>
				{/if}
			</Step>
			<Step locked={true}>
				<svelte:fragment slot="header">Choose a profile picture</svelte:fragment>
				<div class="grid grid-cols-3 gap-4 w-[60vw] h-[60vh]">
					{#each Array(6) as _, index}
						{#if dropzoneFiles[index]}
							<div class="rounded-2xl overflow-hidden flex items-center justify-center bg-black">
								<img
									src={URL.createObjectURL(dropzoneFiles[index][0])}
									alt="Preview"
									class="w-full h-full object-contain"
								/>
							</div>
						{:else}
							<div class="size-full">
								<FileDropzone
									name={`fileInput${index}`}
									accept="image/*"
									bind:files={dropzoneFiles[index]}
									class="size-full"
								>
									<svelte:fragment slot="lead">
										<i class="flex items-center justify-center">
											<Icon icon="bx:file" width="2em" />
										</i>
									</svelte:fragment>
									<svelte:fragment slot="message">
										{#if index === 0}
											Choose your Profile Picture
										{:else}
											Upload a post
										{/if}
									</svelte:fragment>
									<svelte:fragment slot="meta">PNG, JPG and GIF allowed.</svelte:fragment>
								</FileDropzone>
							</div>
						{/if}
					{/each}
				</div>
			</Step>
		</Stepper>
	</div>
	<!-- <div class="p-4 overflow-hidden">
		<div class="h-full p-4">
			<div
				class="grid grid-cols-3 max-h-[70%] min-h-[70%] h-[70%] max-w-[100%] min-w-[100%] w-[100%] gap-4"
			>
				{#each Array(6) as _, index}
					{#if dropzoneFiles[index]}
						<div class="rounded-2xl overflow-hidden flex items-center justify-center bg-black">
							<img
								src={URL.createObjectURL(dropzoneFiles[index][0])}
								alt="Preview"
								class="w-full h-full object-contain"
							/>
						</div>
					{:else}
						<div class="size-full">
							<FileDropzone
								name={`fileInput${index}`}
								accept="image/*"
								bind:files={dropzoneFiles[index]}
								class="size-full"
							>
								<svelte:fragment slot="lead">
									<i class="flex items-center justify-center">
										<Icon icon="bx:file" width="2em" />
									</i>
								</svelte:fragment>
								<svelte:fragment slot="message">
									{#if index === 0}
										Choose your Profile Picture
									{:else}
										Upload a post
									{/if}
								</svelte:fragment>
								<svelte:fragment slot="meta">PNG, JPG and GIF allowed.</svelte:fragment>
							</FileDropzone>
						</div>
					{/if}
				{/each}
			</div>
			<div class="w-full h-[30%] flex items-center justify-center">
				<button class="btn variant-filled" type="submit">Finish</button>
			</div>
		</div> -->
</main>
