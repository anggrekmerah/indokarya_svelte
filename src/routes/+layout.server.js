import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export const load = async ({ cookies, url }) => {
    // Check if the 'session_id' cookie exists.
    const sessionId = cookies.get('session_id');

    // If the user is not logged in and is not on the login page, redirect them.
    if (!sessionId && url.pathname !== '/login') {
        throw redirect(303, '/login');
    } 
};