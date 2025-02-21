async function requestGeolocationPermission() {
	try {
		const result = await navigator.permissions.query({ name: 'geolocation' });
		if (result.state === 'granted') {
			return true;
		} else if (result.state === 'prompt') {
			// Vyvolá prompt pro povolení geolokace
			return new Promise((resolve) => {
				navigator.geolocation.getCurrentPosition(
					() => resolve(true),
					() => resolve(false)
				);
			});
		} else {
			return false;
		}
	} catch (error) {
		console.error("Chyba při zjišťování oprávnění:", error);
		return false;
	}
}

export async function watchPosition(callback) {
	if (!navigator.geolocation) {
		console.error("Geolokace není podporována");
	}

	const permissionGranted = await requestGeolocationPermission();
	if (!permissionGranted) {
		console.error("Oprávnění pro geolokaci nebylo uděleno");
	}

	const watchId = navigator.geolocation.watchPosition(
		(position) => {
			callback([
				position.coords.latitude,
				position.coords.longitude
			]);
		},
		(error) => console.error("Chyba geolokace:", error),
		{
			enableHighAccuracy: true,
			timeout: (10 * 1000),
			maximumAge: 0
		}
	);

	return watchId;
}
