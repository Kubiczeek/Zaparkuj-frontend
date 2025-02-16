<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import {currentPosition, debugPosition} from "$lib/stores/currentPosition.js";
	import {currentPark, parkingOccupancy, showPark} from "$lib/stores/parkingLot.js";
	import parkingLots from "$lib/parkingLots/data.json";
	import {getCurrentPosition} from "$lib/actions/getCurrentPosition.js";
	import {getColorByOccupancy} from "$lib/actions/getColorByOccupancy.js";

	let mapContainer;
	let map;
	let coords = [-1, -1];
	const polygons = [];
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

		polygons.push({id: parkingLotDetails.id, polygon: parkingLot});

		parkingLotMarker.on('click', handleParkingLotClick);
		parkingLot.on('click', handleParkingLotClick);
    }

	async function autoFetchOccupancy() {
		async function getCurrentOccupancy(id) {
			const response = await fetch(`http://127.0.0.1:8000/api/v1/parking-occupancy/${id}`, {
				method: 'GET',
				headers: {
					'Authorization': 'Basic ' + btoa('kubiczeek:xvylUhi&]%,WH@1')
				}
			});

			if (!response.ok) {
				throw new Error('Failed to fetch data');
			}

			const data = await response.json();
			// console.log(data);

			return data.vehicle_count;
		}

		for (const park of parkingLots) {
			try {
				const occupancy = await getCurrentOccupancy(park.id);
				const freeSpaces = park.maxParkingSpaces - occupancy;
				parkingOccupancy.change(park.id, freeSpaces, park.maxParkingSpaces);
			} catch (error) {
				console.error(`Error fetching occupancy for park ${park.id}:`, error);
			}
		}

		polygons.forEach((pLot) => {
			const find = $parkingOccupancy.find((pOcc) => pOcc.id === pLot.id);
			if (find) {
				pLot.polygon.setStyle({color: getColorByOccupancy(find.freeSpaces, find.maxSpaces)});
			}
		});

		setTimeout(autoFetchOccupancy, 5000);
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

        autoFetchOccupancy();
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
