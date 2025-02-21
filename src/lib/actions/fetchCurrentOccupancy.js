export async function getCurrentOccupancy(id) {
	const response = await fetch(`http://127.0.0.1:8000/api/v1/parking-occupancy/${id}`, {
		method: 'GET',
		headers: {
			'Authorization': 'Basic ' + btoa('kubiczeek:xvylUhi&]%,WH@1')
		}
	});

	if (!response.ok) {
		throw new Error('Failed to fetch data');
	}

	const data = await response.json();
	// console.log(data);

	return data.vehicle_count;
}