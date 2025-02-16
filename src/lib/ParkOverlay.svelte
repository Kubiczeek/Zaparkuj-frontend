<script>
    import {clickOutside} from "$lib/actions/clickOutside.js";
    import {fly} from "svelte/transition";
    import ColorNumberText from "$lib/ColorNumberText.svelte";
    import {getDistanceFromLatLonInKm} from "$lib/actions/calculateHaversin.js";
    import {onMount} from "svelte";
    import {currentPark, showPark} from "$lib/stores/parkingLot.js";
    import {getCurrentPosition} from "$lib/actions/getCurrentPosition.js";
    import {debugPosition} from "$lib/stores/currentPosition.js";
    import {notifiedOn} from "$lib/stores/notifiedOn.js";

	let coords = [-1, -1];
    let distance = $state(0);

	async function checkDistance() {
        coords = $debugPosition;// await getCurrentPosition();
        distance = getDistanceFromLatLonInKm($currentPark.center[0], $currentPark.center[1], coords[0], coords[1]);
		let clone = JSON.stringify($currentPark); // Clone the object
		setTimeout(() => {
			if ($showPark && clone === JSON.stringify($currentPark)) {
                checkDistance();
            }
		}, 5 * 1000);
    }

    function calculateTime(distanceInMeters) {
	    let timeInMinutes = 0;
	    let remainingDistance = distanceInMeters;

	    // První segment (0-5km) při 40 km/h
	    if (remainingDistance > 0) {
		    const segment = Math.min(remainingDistance, 5000);
		    timeInMinutes += (segment * 60) / (40 * 1000);
		    remainingDistance -= segment;
	    }

	    // Druhý segment (5-10km) při 57 km/h
	    if (remainingDistance > 0) {
		    const segment = Math.min(remainingDistance, 5000);
		    timeInMinutes += (segment * 60) / (57 * 1000);
		    remainingDistance -= segment;
	    }

	    // Třetí segment (10-50km) při 65 km/h
	    if (remainingDistance > 0) {
		    const segment = Math.min(remainingDistance, 40000);
		    timeInMinutes += (segment * 60) / (65 * 1000);
		    remainingDistance -= segment;
	    }

	    // Čtvrtý segment (50km+) při 70 km/h
	    if (remainingDistance > 0) {
		    timeInMinutes += (remainingDistance * 60) / (70 * 1000);
	    }

	    return timeInMinutes;
    }

    let expectedArrival = $derived.by(() => {
		const now = new Date();
		const travelTime = calculateTime(distance * 1000)
		const arrival = new Date(now.getTime() + travelTime * 60 * 1000);
		// Return the time in the format HH:MM
        return `${arrival.getHours().toString().padStart(2, '0')}:${arrival.getMinutes().toString().padStart(2, '0')}`;
    });

	onMount(() => {
		checkDistance();
    });
</script>

<div class="container" use:clickOutside={{ callback: () => {} }} transition:fly={{ y: 100, duration: 300 }}>
    <h3>Parkoviště - {$currentPark.name} <button class="close" aria-label="Close" onclick={showPark.close}>X</button></h3>
    <p>Aktuálně volných parkovacích míst: <ColorNumberText number={$currentPark.freeParkingSpaces} outOff={$currentPark.maxParkingSpaces} /></p>
    <p>Vzdálenost: <strong>{Math.floor(distance * 1000)} metrů</strong></p>
    <p>Očekávaný příjezd: <strong>{expectedArrival}</strong></p>
    <p>Očekávaný počet volných míst po příjezdu: <ColorNumberText number="10" outOff={$currentPark.maxParkingSpaces} /></p>
    <p>Počet míst pro invalidy: <ColorNumberText number={$currentPark.freeHandicappedSpaces} outOff={$currentPark.maxHandicappedSpaces} /></p>
    <p>Očekávaný počet volných míst pro invalidy po příjezdu: <ColorNumberText number="2" outOff={$currentPark.maxHandicappedSpaces} /></p>
    <div class="prices">
        <p>Parkovné ({$currentPark.paidTime}):</p>
        <div class="list">
            {#each $currentPark.prices as price}
                <p>{price.time} - {price.price} Kč</p>
            {/each}
        </div>
    </div>
    <button class="primary-btn" onclick={() => {
		if ($notifiedOn.includes($currentPark.id)) {
			console.log('Removing', $currentPark.id);
			notifiedOn.remove($currentPark.id);
		} else {
			console.log('Adding', $currentPark.id);
			notifiedOn.add($currentPark.id);
		}
    }}>
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