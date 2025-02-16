import { writable } from "svelte/store";

function createBoolean() {
	const { subscribe, set, update } = writable(false);

	return {
		subscribe,
		set: (position) => set(position),
		update: (position) => update((state) => position),
		open: () => set(true),
		close: () => set(false),
	};
}

export const showPark = createBoolean();