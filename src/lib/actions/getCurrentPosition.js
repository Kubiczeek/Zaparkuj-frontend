export async function getCurrentPosition() {
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