<script lang="ts">
	import Feed from '$lib/components/Feed.svelte';
	let feeds = ["je m'apelle pj et je veux du cul", 'test'];
</script>

<div class="h-[95vh] w-[100vw]">
	<Feed {feeds} />
</div>
