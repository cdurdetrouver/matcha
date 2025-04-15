<script lang="ts">
	import Feed from '$lib/components/Feed.svelte';
	let feeds = ['/user.jpeg', '/blast.jpg'];
</script>

<div class="size-full">
	<Feed {feeds} />
</div>
