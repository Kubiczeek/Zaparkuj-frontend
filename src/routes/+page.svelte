<script>
	import LeafletMap from "$lib/LeafletMap.svelte";
	import {debugPosition} from "$lib/stores/currentPosition.js";
	import ParkOverlay from "$lib/ParkOverlay.svelte";
	import {parkingOccupancy, showPark} from "$lib/stores/parkingLot.js";
	import {notifiedOn} from "$lib/stores/notifiedOn.js";
	import parkingLots from "$lib/parkingLots/data.json";
	import {onMount} from "svelte";
	import {sendNotification} from "$lib/actions/notifications.js";
	import {getDistanceFromLatLonInKm} from "$lib/actions/calculateHaversin.js";

	function checkDistance() {
        let coords = $debugPosition;
		$notifiedOn.forEach((parkId) => {
			let park = parkingLots.find((park) => park.id === parkId);
			let currentPark = $parkingOccupancy.find((park) => park.id === parkId);
			console.log(currentPark)
			let distance = getDistanceFromLatLonInKm(park.center[0], park.center[1], coords[0], coords[1]);
			if (distance < 0.2) {
				let title = "";
				let message = "";
				if (currentPark.freeSpaces === 0) {
                    title = `Parkoviště plně obsazeno!`;
                    message = `Vámi zvolené parkoviště je plně obsazeno. Prosím, vyhledejte jiné.`;
                } else if (currentPark.freeSpaces <= (currentPark.maxSpaces/10)) {
					title = `Parkoviště je skoro plné.`;
					message = `Vámi zvolené parkoviště má volných posledních pár parkovacích míst.`;
                } else {
					title = `Parkoviště má spoustu volných míst.`;
					message = `Vámi zvolené parkoviště má ještě spoustu volných parkovacích míst`;
                }
				sendNotification(title, {
					body: message,
                    icon: '../P.png'
                });

				// Remove the park from the list of notified parks
                notifiedOn.remove(parkId);
			}
        })

		setTimeout(() => {
			checkDistance();
        }, 5 * 1000);
    }

	onMount(() => {
		checkDistance();
	});
</script>

<LeafletMap></LeafletMap>
{#if $showPark}
    <ParkOverlay/>
{/if}
{#if $debugPosition}
    <p>Current marker position: latitude: {$debugPosition[0]}, longitude: {$debugPosition[1]}</p>
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