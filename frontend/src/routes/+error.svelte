<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-10 text-center flex flex-col items-center">
		<h2 class="h2">Error {$page.status}</h2>
		<img class="h-1/4" src="Limousinedeface.JPG" alt="Error {$page.status}" />
		<div class="flex justify-center space-x-2">
			<a class="btn variant-filled" href="/" rel="noreferrer"> go back to safety </a>
		</div>
	</div>
</div>
