import { writable } from "svelte/store";

function createBoolean() {
	const { subscribe, set, update } = writable(null);

	return {
		subscribe,
		set: (position) => set(position),
		update: (position) => update(() => position),
	};
}

export const currentPark = createBoolean();