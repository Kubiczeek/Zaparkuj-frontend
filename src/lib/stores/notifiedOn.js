import {writable} from "svelte/store";

function createNotifiedOn() {
	const {subscribe, set, update} = writable([]);

	return {
		subscribe,
		set,
		add: (id) => update((n) => [...n, id]),
		remove: (id) => update((n) => n.filter((i) => i !== id)),
	}
}

export const notifiedOn = createNotifiedOn();