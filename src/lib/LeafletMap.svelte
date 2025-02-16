<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
    import {currentPosition} from "$lib/stores/currentPosition.js";
	import {showPark} from "$lib/stores/showPark.js";
	import {currentPark} from "$lib/stores/currentPark.js";

	let mapContainer;
	let map;
	let marker;
	let coords = [-1, -1];

	let polygon = [
		[49.608989, 15.579777],
		[49.608791, 15.579724],
		[49.608815, 15.579332],
		[49.609031, 15.579370],
    ]

	async function getCurrentPosition() {
		return new Promise((resolve, reject) => {
			if (!navigator.geolocation) {
				reject(new Error("Geolocation is not supported"));
				return;
			}

			navigator.geolocation.getCurrentPosition(
				(position) => {
					resolve([
						position.coords.latitude,
						position.coords.longitude
					]);
				},
				(error) => reject(error),
				{
					enableHighAccuracy: true,
					timeout: 5000,
					maximumAge: 0
				}
			);
		});
	}

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

	function handleMarkerDrag(e) {
		const newPosition = e.target.getLatLng();
		currentPosition.set(newPosition);
		console.log('Marker moved to:', {
			lat: newPosition.lat.toFixed(6),
			lng: newPosition.lng.toFixed(6)
		});
	}

    function createDevMarker() {
	    marker = L.marker(coords, {
		    draggable: true,
		    autoPan: true
	    }).addTo(map);

	    marker.on('drag', handleMarkerDrag);
    }

	onMount(async () => {
		if(browser) {
			try {
				const leaflet = await import('leaflet');
				coords = await getCurrentPosition();

				map = leaflet.map(mapContainer).setView(coords, 17);

				leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					attribution: '© OpenStreetMap contributors'
				}).addTo(map);

                const parkZone = createCustomMarker([49.608902, 15.579536], '../P.png', {
					iconSize: [22, 30],
                    iconAnchor: [11, 30],
                }).addTo(map);

				parkZone.on('click', () => {
                    showPark.open();
					currentPark.set({
                        lat: 49.608902,
                        lng: 15.579536
                    })
                });

				leaflet.polygon(polygon, {color: 'red'}).addTo(map);

				// createDevMarker();

			} catch (error) {
				console.error("Error getting location:", error.message);
				map.setView([0, 0], 2);
			}
		}
	});

	onDestroy(() => {
		if (map) {
			if (marker) {
				marker.off('dragend', handleMarkerDrag);
			}
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
