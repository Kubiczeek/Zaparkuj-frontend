export const getColorByOccupancy = (occupancy, maxSpace) => {
	if (occupancy <= 1) {
		return "red";
	}

	if (occupancy < Math.min(10, maxSpace / 5)) {
		return "orange";
	}

	return "green";
}