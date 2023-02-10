import { writable } from "svelte/store";

export const logged = writable(false);
export const query = writable("");
export const showLyrics = writable(false);
export const editFavorites = writable(false);