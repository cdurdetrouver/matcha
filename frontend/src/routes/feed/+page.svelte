<script lang="ts">
	import Feed from '$lib/components/Feed.svelte';
	let feeds = [
		{ id: 0, content: '/user.jpeg' },
		{ id: 1, content: '/blast.jpg' }
	];
</script>

<div class="size-full">
	<Feed {feeds} />
</div>
