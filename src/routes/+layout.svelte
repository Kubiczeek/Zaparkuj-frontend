<script>
    import {onMount} from "svelte";

	onMount(() => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js');
		}
    })
</script>

<slot></slot>

<style>
    @import '../app.css';
</style>