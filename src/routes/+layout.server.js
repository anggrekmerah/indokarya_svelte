import { redirect } from '@sveltejs/kit';
import {getLangAPI} from '$lib/tools/clientApi'
import { user } from '$lib/stores/user.js';
import { get } from 'svelte/store';

/** @type {import('./$types').LayoutServerLoad} */
export const load = async ({ cookies, url, locals, fetch }) => {
    // Check if the 'session_id' cookie exists.
    const sessionId = cookies.get('session_id');

    // If the user is not logged in and is not on the login page, redirect them.
    if (!sessionId && url.pathname !== '/login') {
        throw redirect(303, '/login');
    } 

    const dataUser = get(user)
    let userLang = null
    if(dataUser !== null) {
        const lang = await getLangAPI({'id_user':dataUser.id}, fetch)
        userLang = lang.data.lang
    }
    


    return {
		users: userLang
	};

};