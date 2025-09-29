import { getTicketAssign, ticketCheckInAPI } from '$lib/tools/ticketApi';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url, fetch, locals }) {
  
    // You can use fetch to call APIs or access database here
    const idUser = locals.user.id
    const status = url.searchParams.get('status')
    const bodyReq = (status) ? {"ID" : idUser, id_status:status} : {"ID" : idUser}
    const listTicket = await getTicketAssign(bodyReq, fetch)
    return {
        listTicket: listTicket.data
    };
}