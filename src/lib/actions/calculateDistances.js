export function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
	const R = 6371; // Radius of the Earth in kilometers
	const dLat = deg2rad(lat2 - lat1);
	const dLon = deg2rad(lon2 - lon1);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c; // Distance in kilometers
}

function deg2rad(deg) {
	return deg * (Math.PI / 180);
}

export function calculateTime(distanceInMeters) {
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