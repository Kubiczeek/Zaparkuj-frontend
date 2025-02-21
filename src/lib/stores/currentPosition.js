import { writable } from "svelte/store";

export const currentPosition = writable([49.6069, 15.5793]);
export const geoPermission = writable(false);
export const debugPosition = writable(null);