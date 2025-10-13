import { getTicketAssign, ticketCheckInAPI } from '$lib/tools/ticketApi';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url, fetch, locals }) {
  
    // You can use fetch to call APIs or access database here
    const idUser = locals.user.id
    let payload = {"ID" : idUser}

    const status = url.searchParams.get('status')
    if(status)
        payload.id_status = status
    
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')
    if(from && to) {
        payload.date_from = from
        payload.date_to = to
    }

    const priority = url.searchParams.get('priority')
    if(priority)
        payload.id_priority = priority

    const listTicket = await getTicketAssign(payload, fetch)
    return {
        listTicket: listTicket.data
    };
}