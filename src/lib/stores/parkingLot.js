import { writable } from "svelte/store";

function createBoolean() {
	const { subscribe, set, update } = writable(false);

	return {
		subscribe,
		set: (position) => set(position),
		update: (position) => update(() => position),
		open: () => set(true),
		close: () => set(false),
	};
}

function createParkingOccupancy() {
	const { subscribe, set, update } = writable([{id: 0, occupancy: 0}]);

	return {
		subscribe,
		set: (position) => set(position),
		update: (position) => update(() => position),
		change: (id, freeSpaces) => update((n) => {
			const park = n.find((i) => i.id === id);
			if (park) {
				park.freeSpaces = freeSpaces;
			} else {
				n.push({ id: id, freeSpaces: freeSpaces });
			}
			return n;
		}),
	};
}

export const showPark = createBoolean();
export const currentPark = writable(null);
export const parkingOccupancy = createParkingOccupancy();
