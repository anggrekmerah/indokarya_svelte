
import { user } from '$lib/stores/user.js';
import { get } from 'svelte/store';

/** @type {import('./$types').LayoutServerLoad} */
export async function load() {
	return {
		users: get(user)
	};
}

