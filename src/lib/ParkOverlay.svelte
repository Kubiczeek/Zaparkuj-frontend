<script>
    import {clickOutside} from "$lib/actions/clickOutside.js";
    import {fly} from "svelte/transition";
    import ColorNumberText from "$lib/ColorNumberText.svelte";
    import {getDistanceFromLatLonInKm, calculateTime} from "$lib/actions/calculateDistances.js";
    import {onDestroy, onMount} from "svelte";
    import {currentPark, parkingOccupancy, showPark} from "$lib/stores/parkingLot.js";
    import {currentPosition, geoPermission} from "$lib/stores/currentPosition.js";
    import {notifiedOn} from "$lib/stores/notifiedOn.js";

    let distance = $state(0);
	let occupancy = $state(0);
	let expectedOccupancy = $state(0);

	let unsubscribes = [];

	function handleNotification() {
		Notification.requestPermission().then(permission => {
			if (permission === 'granted') {
				if ($notifiedOn.includes($currentPark.id)) {
					notifiedOn.remove($currentPark.id);
				} else {
					notifiedOn.add($currentPark.id);
				}
			} else {
                alert('Notifikace nejsou povoleny.');
            }
		});
    }

    function getCurrentOccupancy(id) {
	    const park = $parkingOccupancy.find(park => park.id === id);
	    occupancy = park ? park.occupancy : 0;
    }

    let expectedArrival = $derived.by(() => {
	    const now = new Date();
	    const travelTime = calculateTime(distance * 1000)
	    const arrival = new Date(now.getTime() + travelTime * 60 * 1000);
	    // Return the time in the format HH:MM
	    return `${arrival.getHours().toString().padStart(2, '0')}:${arrival.getMinutes().toString().padStart(2, '0')}`;
    });

	async function getExpectedOccupancy(time) {
		return await fetch(`http://127.0.0.1:8000/api/v1/parking-occupancy/${$currentPark.id}/history?time_arrival=${time}`, {
			method: 'GET',
			headers: {
				'Authorization': 'Basic ' + btoa('kubiczeek:xvylUhi&]%,WH@1')
			}
		})
        .then(response => response.json())
        .then(data => data.expected_occupancy)
        .catch(err => console.error(err));
    }

	onMount(() => {
		unsubscribes.push(currentPosition.subscribe((coords) => {
            if (coords && $geoPermission) {
	            distance = getDistanceFromLatLonInKm($currentPark.center[0], $currentPark.center[1], coords[0], coords[1]);
            }
        }));
		unsubscribes.push(currentPark.subscribe(async () => {
			expectedOccupancy = await getExpectedOccupancy(expectedArrival);
        }));

		getCurrentOccupancy($currentPark.id);
    });

	onDestroy(() => {
		unsubscribes.forEach(unsubscribe => unsubscribe());
    })
</script>

<div class="container" use:clickOutside={{ callback: showPark.close }} transition:fly={{ y: 100, duration: 300 }}>
    <h3>Parkoviště - {$currentPark.name} <button class="close" aria-label="Close" onclick={showPark.close}>X</button></h3>
    <p>Aktuálně volných parkovacích míst: <ColorNumberText number={$currentPark.maxParkingSpaces-occupancy} outOff={$currentPark.maxParkingSpaces} /></p>
    {#if $geoPermission}
        <p>Vzdálenost: <strong>{Math.floor(distance * 1000)} metrů</strong></p>
        <p>Očekávaný příjezd: <strong>{expectedArrival}</strong></p>
        <p>Očekávaný počet volných míst po příjezdu: <ColorNumberText number={$currentPark.maxParkingSpaces-expectedOccupancy} outOff={$currentPark.maxParkingSpaces} /></p>
        <div class="prices">
            <p>Parkovné ({$currentPark.paidTime}):</p>
            <div class="list">
                {#each $currentPark.prices as price}
                    <p>{price.time} - {price.price} Kč</p>
                {/each}
            </div>
        </div>
    {:else}
        <div class="prices">
            <p>Parkovné ({$currentPark.paidTime}):</p>
            <div class="list">
                {#each $currentPark.prices as price}
                    <p>{price.time} - {price.price} Kč</p>
                {/each}
            </div>
        </div>
        <strong>Pro zobrazení vzdálenosti, očekávaného příjezdu a předpokládáané obsazenosti povolte polohu.</strong>
    {/if}
    <button class="primary-btn" onclick={handleNotification}>
        {#if $notifiedOn.includes($currentPark.id)}
            Zrušit oznámení
        {:else}
            Notifikovat při přiblížení
        {/if}
    </button>
</div>

<style>
    .container {
        position: fixed;
        display: flex;
        max-width: 40rem;
        width: 100%;
        flex-direction: column;
        z-index: 1000;
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--color-white);
        padding: 1rem;
        border-top-right-radius: 1rem;
        border-top-left-radius: 1rem;
        box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.2);
        bottom: 0;

        h3 {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .close {
                background-color: transparent;
                border: none;
                cursor: pointer;
            }
        }

        p {
            font-size: 1.05rem;

            strong {
                font-weight: 600;
            }
        }

        .prices {
            display: flex;
            flex-direction: row;
            gap: .5rem;

            .list {
                display: flex;
                flex-direction: column;

                p {
                    font-weight: 500;
                }
            }
        }

        .primary-btn {
            background-color: var(--color-primary);
            color: var(--color-white);
            font-weight: 500;
            margin: 1rem 0 0;
            padding: .5rem;
            border: none;
            border-radius: .5rem;
            cursor: pointer;
        }
    }
</style>