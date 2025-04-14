<script lang="ts">
	import Feed from '$lib/components/Feed.svelte';
	let feeds = ["je m'apelle pj et je veux du cul", 'test'];
</script>

<div class="size-full">
	<Feed {feeds} />
</div>
