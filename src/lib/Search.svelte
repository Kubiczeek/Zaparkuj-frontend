<script>
	import { fade, scale } from "svelte/transition";
    import { magnifier } from "$lib/assets/images";
	import parkingLots from "$lib/parkingLots/data.json";
	import { currentPark, showPark } from "$lib/stores/parkingLot.js";
	import { getDistanceFromLatLonInKm } from "$lib/actions/calculateDistances.js";
	import { goto } from "$app/navigation";
	import {mapBounds, polygons} from "$lib/stores/map.js";
	import {currentPosition} from "$lib/stores/currentPosition.js";
	import {onMount} from "svelte";

	let searchTerm = "";
	let parkingLotsWithDistance = [];
	const URL_PATH_PREFIX = "?SET_PATH=";

	$: filteredParkingLots = parkingLotsWithDistance.filter(park =>
		park.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	function handleKeydown(event) {
		if (event.key === 'Enter' && searchTerm.startsWith(URL_PATH_PREFIX)) {
			const path = searchTerm.substring(URL_PATH_PREFIX.length);
			goto(path, { replaceState: true });
			searchTerm = "";
		}
	}

	function formatDistance(distance) {
		return distance < 1 ? `${Math.round(distance * 1000)}m daleko` : `${distance.toFixed(1)} km daleko`;
	}

	function selectParkingLot(park) {
		currentPark.set(park);
		showPark.open();
		$polygons.forEach((polygon) => {
			if (polygon.id === park.id) {
				mapBounds.set(polygon.polygon.getBounds());
            }
        })
		searchTerm = "";
	}

	onMount(() => {
		currentPosition.subscribe((coords) => {
			parkingLotsWithDistance = parkingLots.map(park => ({
				...park,
				distance: getDistanceFromLatLonInKm(
					park.center[0],
					park.center[1],
					coords[0],
					coords[1]
				)
			}));
		});
    })
</script>

<div class="search-wrapper">
    <div class="search-bar">
        <input
                type="text"
                bind:value={searchTerm}
                placeholder="Vyhledat parkoviště..."
                onkeydown={handleKeydown}
        />
        <img src={magnifier} alt="Search" class="search-icon" />
    </div>

    {#if searchTerm && filteredParkingLots.length > 0}
        <div class="results" transition:scale|local={{duration: 200, start: 0.95}}>
            {#each filteredParkingLots as park}
                <button class="result-item"
                        in:fade|local={{duration: 150, delay: 100}}
                        out:fade|local={{duration: 100}}
                        onclick={() => selectParkingLot(park)}
                >
                    <span class="name">{park.name}</span>
                    <span class="distance">{formatDistance(park.distance)}</span>
                </button>
            {/each}
        </div>
    {/if}
</div>

<style>
    .search-wrapper {
        position: fixed;
        z-index: 1000;
        top: 1rem;
        left: 50%;
        transform: translateX(-50%);
        width: 90%;
        max-width: 40rem;
        display: flex;
        flex-direction: column;

        .search-bar {
            display: flex;
            align-items: center;
            background: white;
            border-radius: 1.5rem;
            padding: 0.75rem 1rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            position: relative;
            z-index: 2;

            input {
                flex: 1;
                border: none;
                font-size: 1rem;
                background: none;
                outline: none;
            }

            .search-icon {
                width: 1.25rem;
                height: 1.25rem;
                opacity: 0.6;
            }
        }

        .results {
            background: white;
            border-radius: 0.75rem;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            overflow: hidden;
            margin-top: -2rem;
            position: relative;
            z-index: 1;

            .result-item {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                padding: 0.5rem 1rem;
                width: 100%;
                gap: 0;
                border: none;
                background: none;
                text-align: left;
                cursor: pointer;
                transition: background-color 0.2s;
                border-bottom: 1px solid #e0e0e0;

                &:first-child {
                    padding-top: 2.5rem;
                }

                &:last-child {
                    border-bottom: none;
                }

                &:hover {
                    background-color: #f5f5f5;
                }

                span {
                    line-height: 1.2;
                }

                .distance {
                    font-size: 0.875rem;
                    color: #666;
                }

                .name {
                    font-size: 1rem;
                    font-weight: 500;
                }
            }
        }
    }
</style>
