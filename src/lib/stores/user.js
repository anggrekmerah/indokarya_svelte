import { writable } from 'svelte/store';

// A writable store to hold the user data.
// It's initialized to null, as there is no logged-in user yet.
export const user = writable(null); 