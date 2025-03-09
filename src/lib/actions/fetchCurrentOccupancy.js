const BACKEND_URL = 'http://127.0.0.1:8000';

export async function getCurrentOccupancy(id) {
	const response = await fetch(`${BACKEND_URL}/api/v1/parking-occupancy/${id}`, {
		method: 'GET',
		headers: {
			'Authorization': 'Basic ' + btoa('kubiczeek:xvylUhi&]%,WH@1')
		}
	});

	if (!response.ok) {
		// throw new Error('Failed to fetch data');
		return 0;
	}

	const data = await response.json();
	// console.log(data);

	return data.vehicle_count;
}