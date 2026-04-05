import { redirect } from '@sveltejs/kit';
import {getLangAPI} from '$lib/tools/clientApi'
import { ClientMenuAPI } from '$lib/tools/menuApi';
import { LangAPI } from '$lib/tools/langApi';
import { userGroupAPI } from '$lib/tools/userGroupAPI';


/** @type {import('./$types').LayoutServerLoad} */
export const load = async ({ cookies, url, locals, fetch }) => {
    // Check if the 'session_id' cookie exists.
    // const sessionId = cookies.get('session_id');

    // // If the user is not logged in and is not on the login page, redirect them.
    // if (!sessionId && url.pathname !== '/login') {
    //     throw redirect(303, '/login');
    // } 

    if (!locals.user) {
		return {
			user: null,
			menu: [],
			lang: null,
			group: []
		};
	}

    const [menu, lang, group] = await Promise.all([
		ClientMenuAPI({ email: locals.user.email }, fetch),
		LangAPI({ id_user: locals.user.id }, fetch),
		userGroupAPI({ id_user: locals.user.id }, fetch)
	]);
    console.log('menu.data')
	console.log(menu.data)
    return {
        user: locals.user,
		menu: menu.data,
		userLang: lang.data,
		group: group.data
	};

};