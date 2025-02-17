import { writable } from "svelte/store";

function createCurrentPosition() {
	  const { subscribe, set, update } = writable(null);

  return {
	subscribe,
	set: (position) => set(position),
	update: (position) => update(() => position),
  };
}

export const currentPosition = createCurrentPosition();
export const debugPosition = createCurrentPosition();