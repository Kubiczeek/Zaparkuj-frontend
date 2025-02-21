<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import {currentPosition, debugPosition} from "$lib/stores/currentPosition.js";
	import {currentPark, parkingOccupancy, showPark} from "$lib/stores/parkingLot.js";
	import parkingLots from "$lib/parkingLots/data.json";
	import {getColorByOccupancy} from "$lib/actions/getColorByOccupancy.js";
	import {mapBounds, polygons} from "$lib/stores/map.js";

	let mapContainer;
	let initialized = false;
	let map;
	let currentMarker;
	const ZOOM = 17;
	const DEFAULT_COORDS = [49.6069, 15.5793];

	function createCustomMarker(latlng, imageUrl, options = {}) {
		const defaultOptions = {
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			shadowSize: [41, 41],
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
	    let marker = L.marker(DEFAULT_COORDS, {
		    draggable: true,
		    autoPan: true
	    }).addTo(map);

	    marker.on('drag', (e) => {
		    const newPosition = e.target.getLatLng();
		    debugPosition.set([newPosition.lat.toFixed(6), newPosition.lng.toFixed(6)]);
        });
    }

	function createParkingLot(parkingLotDetails) {
		const parkingLot = L.polygon(parkingLotDetails.polygon, {color: getColorByOccupancy(parkingLotDetails?.freeParkingSpaces, parkingLotDetails?.maxParkingSpaces)}).addTo(map);
        const parkingLotMarker = createCustomMarker(parkingLotDetails.center, '../P.png', {
	        iconSize: [22, 30],
	        iconAnchor: [11, 30],
        }).addTo(map);

		function handleParkingLotClick() {
			showPark.open();
			currentPark.set(parkingLotDetails);
        }

		polygons.add(parkingLotDetails.id, parkingLot)

		parkingLotMarker.on('click', handleParkingLotClick);
		parkingLot.on('click', handleParkingLotClick);
    }

	function updatePolygonColor() {
		$polygons.forEach((pLot) => {
			const find = $parkingOccupancy.find((pOcc) => pOcc.id === pLot.id);
			if (find) {
				pLot.polygon.setStyle({color: getColorByOccupancy(find.freeSpaces, find.maxSpaces)});
			}
		});
	}

	onMount(async () => {
		if(browser) {
			try {
				const leaflet = await import('leaflet');

				map = leaflet.map(mapContainer, {zoomControl: false}).setView(DEFAULT_COORDS, ZOOM);

				leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					attribution: '© OpenStreetMap contributors',
                    maxZoom: 18
				}).addTo(map);

                parkingLots.forEach(createParkingLot);
			} catch (error) {
				console.error("Error getting location:", error.message);
				map.setView([0, 0], 2);
			}
		}

		mapBounds.subscribe((bounds) => {
			if (bounds && map) {
				map.fitBounds(bounds, {
					padding: [50, 50],
					maxZoom: 18,
					animate: true,
					duration: 1
				});
			}
		});

		currentPosition.subscribe((coords) => {
			if (map && coords) {
				if (!initialized) {
                    initialized = true;
                    map.setView(coords, ZOOM);
					currentMarker = createCustomMarker(coords, '../current.png', {
						iconSize: [66, 66],
						iconAnchor: [33, 33],
					}).addTo(map);
                }

				currentMarker.setLatLng(coords);
			}
        });

		parkingOccupancy.subscribe(() => {
			updatePolygonColor();
        });
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
