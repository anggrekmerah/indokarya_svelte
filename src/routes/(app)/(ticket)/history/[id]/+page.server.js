import { ticketDetailHistoryAPI } from '$lib/tools/ticketApi';
import { fail, redirect } from '@sveltejs/kit';
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_ID } from '$env/static/private';


/** @type {import('./$types').PageServerLoad} */
export async function load({ params, fetch, locals }) {
  // You can use fetch to call APIs or access database here
    
    const detailTicket = await ticketDetailHistoryAPI({ID : locals.user.id, id_ticket: params.id}, fetch)
    console.log(JSON.stringify(detailTicket, null, 4));
    if(detailTicket.error){
        // If the process is successful, redirect the user
            redirect(303, '/home');
    }     

    return {
        detailTicket: detailTicket.data[0],
        mapsKey : GOOGLE_MAPS_API_KEY,
        mapsId : GOOGLE_MAPS_ID
    };
}