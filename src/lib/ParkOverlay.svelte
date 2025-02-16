<script>
    import {clickOutside} from "$lib/actions/clickOutside.js";
    import {showPark} from "$lib/stores/showPark.js";
    import {fly} from "svelte/transition";
    import ColorNumberText from "$lib/ColorNumberText.svelte";
    import {currentPark} from "$lib/stores/currentPark.js";
    import {getDistanceFromLatLonInKm} from "$lib/actions/calculateHaversin.js";
    import {onMount} from "svelte";

	let coords = [-1, -1];
    let distance = 0;

    function requestNotificationPermission() {
	    if ('Notification' in window) {
		    Notification.requestPermission().then(permission => {
			    if (permission === 'granted') {
				    console.log('Notification permission granted.');
			    } else {
				    console.log('Notification permission denied.');
			    }
		    });
	    } else {
		    console.log('Notifications are not supported by this browser.');
	    }
    }

    function sendNotification(title, options) {
	    if ('Notification' in window && Notification.permission === 'granted') {
		    new Notification(title, options);
	    }
    }

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

	onMount(async () => {
		coords = await getCurrentPosition();
		distance = getDistanceFromLatLonInKm($currentPark.lat, $currentPark.lng, coords[0], coords[1]);
    })
</script>

<div class="container" use:clickOutside={{ callback: () => showPark.close() }} transition:fly={{ y: 100, duration: 300 }}>
    <h3>Parkoviště - GHB (Učitelé) <button class="close" aria-label="Close" onclick={showPark.close}>X</button></h3>
    <p>Aktuálně volných parkovacích míst: <ColorNumberText number="13" outOff="90" /></p>
    <p>Vzdálenost: <strong>{parseInt(distance * 1000)} metrů</strong></p>
    <p>Očekávaný příjezd: <strong>17:43</strong></p>
    <p>Očekávaný počet volných míst po příjezdu: <ColorNumberText number="10" outOff="90" /></p>
    <p>Počet míst pro invalidy: <ColorNumberText number="2" outOff="2" /></p>
    <p>Očekávaný počet volných míst pro invalidy po příjezdu: <ColorNumberText number="2" outOff="2" /></p>
    <div class="prices">
        <p>Parkovné (po-pá: 7-17):</p>
        <div class="list">
            <p>Prvních 30min - 3 Kč</p>
            <p>15 Kč/h</p>
        </div>
    </div>
    <button class="primary-btn" onclick={() => {
		requestNotificationPermission();
		sendNotification('Hello!', {
			body: 'This is a test notification.',
			icon: '../P.png',
		});
    }}>
        Notifikovat při přiblížení
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