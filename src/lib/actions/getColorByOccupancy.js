export const getColorByOccupancy = (freeSpace, maxSpace) => {
	if (freeSpace <= 1) {
		return "red";
	}

	if (freeSpace < maxSpace / 10) {
		return "orange";
	}

	return "green";
}