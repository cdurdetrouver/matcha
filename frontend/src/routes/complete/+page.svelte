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
	let inputGender = '';
	let inputSexual = '';
	let dropzoneFiles: (FileList | undefined)[] = Array(6).fill(undefined);
	let userLocation: { latitude: number | null; longitude: number | null; city: string } = {
		latitude: null,
		longitude: null,
		city: ''
	};
	let locationError = '';

	async function getCurrentPosition(latitude: number, longitude: number) {
		try {
			const response = await fetch(
				`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
			);
			const data = await response.json();
			if (data) {
				userLocation.city = data.city;
			}
		} catch (error) {
			console.error('Error fetching location data :', error);
		}
	}

	async function fetchLocationByIP() {
		try {
			const response = await fetch('http://ip-api.com/json/');
			if (!response.ok) throw new Error('Failed to fetch location by IP');
			const data = await response.json();
			return {
				latitude: data.lat,
				longitude: data.lon,
				city: data.city || 'Unknown'
			};
		} catch (error) {
			console.error('Failed to fetch location by IP:', error);
			return null;
		}
	}

	function requestLocation() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				async (position) => {
					userLocation.latitude = position.coords.latitude;
					userLocation.longitude = position.coords.longitude;
					locationError = '';
					await getCurrentPosition(position.coords.latitude, position.coords.longitude);
				},
				async (error) => {
					switch (error.code) {
						case error.PERMISSION_DENIED:
							locationError = 'User denied the request for Geolocation.';
							break;
						case error.POSITION_UNAVAILABLE:
							locationError = 'Location information is unavailable.';
							break;
						case error.TIMEOUT:
							locationError = 'The request to get user location timed out.';
							break;
						default:
							locationError = 'An unknown error occurred.';
							break;
					}
					const res = await fetchLocationByIP();
					if (res) {
						userLocation = res;
						locationError = '';
					}
				}
			);
		} else {
			locationError = 'Geolocation is not supported by this browser.';
		}
	}

	function isValidOption(Options: AutocompleteOption<string>[], input: string): boolean {
		return Options.some((option) => option.label === input);
	}

	async function complete() {
		alert(inputGender + ' ' + value);
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

	function deleteImage(index: number): void {
		dropzoneFiles[index] = undefined;
	}

	function isPhotoValid(Files: (FileList | undefined)[]) {
		if (Files[0] === undefined) return false;

		const allOtherFilesUndefined = Files.slice(1).every((file) => file === undefined);

		if (allOtherFilesUndefined) return false;

		return true;
	}
</script>

<main class="flex items-center justify-center size-full">
	<div class="card p-4 text-token">
		<Stepper on:complete={complete}>
			<Step
				locked={userLocation.city === '' ||
					userLocation.latitude === null ||
					userLocation.longitude === null}
			>
				<svelte:fragment slot="header">We need your location</svelte:fragment>
				<div class="size-full flex items-center justify-center gap-5">
					<button type="button" class="btn variant-filled" on:click={requestLocation}>
						Request Location
					</button>

					<input
						class="input p-2"
						placeholder="Your location"
						bind:value={userLocation.city}
						readonly
					/>
				</div>
				{#if locationError}
					<p class="text-red-500">{locationError}</p>
				{/if}
			</Step>
			<Step>
				<svelte:fragment slot="header">What are you looking for ?</svelte:fragment>
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
			<Step locked={!isPhotoValid(dropzoneFiles)}>
				<svelte:fragment slot="header"
					>Choose a profile picture and at least one post</svelte:fragment
				>
				<div class="grid grid-cols-3 gap-4 w-full">
					{#each Array(6) as _, index}
						{#if dropzoneFiles[index]}
							<div
								class="relative rounded-2xl overflow-hidden flex items-center justify-center bg-black group size-full aspect-[0.75]"
							>
								<img
									src={URL.createObjectURL(dropzoneFiles[index][0])}
									alt="Preview"
									class="size-full object-contain absolute top-0 left-0"
								/>
								<button
									class="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
									on:click={() => deleteImage(index)}
								>
									<Icon icon="mdi:trash-can" width="1.5em" />
								</button>
							</div>
						{:else}
							<FileDropzone
								name={`fileInput${index}`}
								accept="image/*"
								bind:files={dropzoneFiles[index]}
								class="size-full aspect-[0.75]"
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
						{/if}
					{/each}
				</div>
			</Step>
		</Stepper>
	</div>
</main>
