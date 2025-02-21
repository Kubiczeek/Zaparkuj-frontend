export const getColorByOccupancy = (freeSpace, maxSpace) => {
	if (freeSpace <= 1) {
		return "red";
	}

	if (freeSpace < Math.min(10, maxSpace / 5)) {
		return "orange";
	}

	return "green";
}