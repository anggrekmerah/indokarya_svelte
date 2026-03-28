import { ticketDetailHistoryAPI } from '$lib/tools/ticketApi';
import { fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';


/** @type {import('./$types').PageServerLoad} */
export async function load({ params, fetch, locals, parent }) {
  // You can use fetch to call APIs or access database here
    const parentData = await parent()
    const detailTicket = await ticketDetailHistoryAPI({ID : parentData.user.id, id_ticket: params.id}, fetch)
    console.log(JSON.stringify(detailTicket, null, 4));
    if(detailTicket.error){
        // If the process is successful, redirect the user
            redirect(303, '/home');
    }     

    return {
        detailTicket: detailTicket.data[0],
        mapsKey : env.GOOGLE_MAPS_API_KEY,
        mapsId : env.GOOGLE_MAPS_ID
    };
}