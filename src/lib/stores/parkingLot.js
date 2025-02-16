import { writable } from "svelte/store";

function createCurrentPark() {
	const { subscribe, set, update } = writable(null);

	return {
		subscribe,
		set: (position) => set(position),
		update: (position) => update(() => position),
	};
}

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

export const showPark = createBoolean();
export const currentPark = createCurrentPark();