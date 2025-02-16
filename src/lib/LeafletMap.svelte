<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import {currentPosition, debugPosition} from "$lib/stores/currentPosition.js";
    import {currentPark, showPark} from "$lib/stores/parkingLot.js";
	import parkingLots from "$lib/parkingLots/data.json";
	import {getCurrentPosition} from "$lib/actions/getCurrentPosition.js";
	import {getColorByOccupancy} from "$lib/actions/getColorByOccupancy.js";

	let mapContainer;
	let map;
	let coords = [-1, -1];
	const ZOOM = 17;

	/**
     * Create a custom marker with an image.
     * @param {Array} latlng - Latitude and longitude of the marker.
     * @param {string} imageUrl - URL of the image to use as the marker.
     * @param {Object} options - Options for the marker.
     * @returns {L.Marker} - Custom marker.
     */
	function createCustomMarker(latlng, imageUrl, options = {}) {
		const defaultOptions = {
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			shadowSize: [41, 41],
			shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
		};

		const customIcon = L.icon({
			iconUrl: imageUrl,
			...defaultOptions,
			...options
		});

		return L.marker(latlng, {
			icon: customIcon,
			draggable: options.draggable || false
		});
	}

    function createDevMarker() {
	    let marker = L.marker(coords, {
		    draggable: true,
		    autoPan: true
	    }).addTo(map);

	    marker.on('drag', (e) => {
		    const newPosition = e.target.getLatLng();
		    debugPosition.set([newPosition.lat.toFixed(6), newPosition.lng.toFixed(6)]);
		    // console.log('Marker moved to:', {
			//     lat: newPosition.lat.toFixed(6),
			//     lng: newPosition.lng.toFixed(6)
		    // });
        });
    }

	/**
     * Create a parking lot on the map.
     * @param {Object} parkingLotDetails - Details of the parking lot.
     */
	function createParkingLot(parkingLotDetails) {
		const parkingLot = L.polygon(parkingLotDetails.polygon, {color: getColorByOccupancy(parkingLotDetails.freeParkingSpaces, parkingLotDetails.maxParkingSpaces)}).addTo(map);
        const parkingLotMarker = createCustomMarker(parkingLotDetails.center, '../P.png', {
	        iconSize: [22, 30],
	        iconAnchor: [11, 30],
        }).addTo(map);

		function handleParkingLotClick() {
			showPark.open();
			currentPark.set(parkingLotDetails);
        }

		parkingLotMarker.on('click', handleParkingLotClick);
		parkingLot.on('click', handleParkingLotClick);
    }

	onMount(async () => {

		if(browser) {
			try {
				const leaflet = await import('leaflet');

				coords = await getCurrentPosition();
				currentPosition.set(coords);

				map = leaflet.map(mapContainer).setView(coords, ZOOM);

				leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					attribution: '© OpenStreetMap contributors'
				}).addTo(map);

                parkingLots.forEach(createParkingLot);
				createDevMarker();
			} catch (error) {
				console.error("Error getting location:", error.message);
				map.setView([0, 0], 2);
			}
		}
	});

	onDestroy(() => {
		if (map) {
			map.remove();
		}
	});
</script>

<div bind:this={mapContainer}></div>

<style>
    @import 'leaflet/dist/leaflet.css';

    div {
        width: 100dvw;
        height: 100dvh;
    }
</style>
