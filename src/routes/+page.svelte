<script>
	import LeafletMap from "$lib/LeafletMap.svelte";
	import {currentPosition} from "$lib/stores/currentPosition.js";
	import {showPark} from "$lib/stores/showPark.js";
	import ParkOverlay from "$lib/ParkOverlay.svelte";
</script>

<LeafletMap></LeafletMap>
{#if $showPark}
    <ParkOverlay/>
{/if}
{#if $currentPosition}
    <p>Current marker position: latitude: {$currentPosition.lat?.toFixed(6)}, longitude: {$currentPosition.lng?.toFixed(6)}</p>
{/if}

<style>
    p {
        position: fixed;
        z-index: 1000;
        bottom: 0;
        left: 0;
        background-color: white;
        padding: 0.5rem;
        border-radius: 0.25rem;
        margin: 0.5rem;
        box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.1);
        font-weight: 500;
    }
</style>