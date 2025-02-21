<script>
	import LeafletMap from "$lib/LeafletMap.svelte";
	import ParkOverlay from "$lib/ParkOverlay.svelte";
	import parkingLots from "$lib/parkingLots/data.json";
	import {currentPosition, debugPosition, geoPermission} from "$lib/stores/currentPosition.js";
	import {parkingOccupancy, showPark} from "$lib/stores/parkingLot.js";
	import {notifiedOn} from "$lib/stores/notifiedOn.js";
	import {onDestroy, onMount} from "svelte";
	import {sendNotification} from "$lib/actions/notifications.js";
	import {getDistanceFromLatLonInKm} from "$lib/actions/calculateHaversin.js";
	import {getAllParkingLotIds} from "$lib/actions/getAllParkingLotIds.js";
	import {getCurrentOccupancy} from "$lib/actions/fetchCurrentOccupancy.js";
	import {watchPosition} from "$lib/actions/geolocation.js";
	import Search from "$lib/Search.svelte";

	let watchId;

	function handleParkingNotifications(coords) {
		$notifiedOn.forEach((parkId) => {
			let park = parkingLots.find((park) => park.id === parkId);
			let currentPark = $parkingOccupancy.find((park) => park.id === parkId);
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
    }

	async function loadParkingOccupancy() {
        const reduced = parkingLots.map((park) => ({id: park.id, freeSpaces: 0, maxSpaces: park.maxParkingSpaces}));
		parkingOccupancy.set(reduced);

		await updateParkingOccupancy();
    }

	async function updateParkingOccupancy() {
		const parkingLotIds = getAllParkingLotIds();

		const allOccupancy = await Promise.all(parkingLotIds.map(async (id) => ({id: id, freeSpaces: await getCurrentOccupancy(id)})));

		allOccupancy.forEach((park) => {
			parkingOccupancy.change(park.id, park.freeSpaces);
        })

		setTimeout(() => {
			updateParkingOccupancy();
		}, 5 * 1000);
    }

	onMount(async () => {
		// Load recursive functions
		await loadParkingOccupancy();
		watchId = watchPosition((coords) => {
			currentPosition.set(coords);
			geoPermission.set(true);
			console.log("Current position:", coords);
        })

		// Check if the user is near a parking lot
		currentPosition.subscribe((coords) => {
			handleParkingNotifications(coords);
        })
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.navigator.geolocation.clearWatch(watchId);
		}
	})
</script>

<Search />
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