<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton';
	export let data;
</script>

<div class="size-full flex items-center justify-center">
	<Avatar src="/{data.chats[0].avatar}" width="w-12" />
</div>
