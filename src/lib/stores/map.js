import { writable } from "svelte/store";

function createPolygonStore() {
	const { subscribe, set, update } = writable([]);

	return {
		subscribe,
		set: (polygon) => set(polygon),
		add: (id, polygon) => update((n) => {
			n.push({ id: id, polygon: polygon });
			return n;
		}),
	};
}

export const mapBounds = writable(null);
export const polygons = createPolygonStore();