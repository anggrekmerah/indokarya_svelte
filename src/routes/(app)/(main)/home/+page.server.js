import { getTicketAssign } from '$lib/tools/ticketApi';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url, fetch, locals }) {
  
    // You can use fetch to call APIs or access database here
    const idUser = locals.user.id
    let payload = {"ID" : idUser, from:'server'}
    let isSearch = false

    const status = url.searchParams.get('status')
    if(status){
        payload.id_status = status
        isSearch = true
    }
    
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')
    if(from && to) {
        payload.date_from = from
        payload.date_to = to
        isSearch = true
    }

    const priority = url.searchParams.get('priority')
    if(priority){
        payload.id_priority = priority
        isSearch = true
    }

    const ticket = url.searchParams.get('id_ticket')
    if(ticket){
        payload.id_ticket = ticket
        isSearch = true
    }

    
    const listTicket = await getTicketAssign(payload, fetch)

    if(listTicket.error){
        listTicket.data = {items : [], search : isSearch, hasMore:false, offset:0}
    }
        
    console.log('listTickets')
    console.log(listTicket.data)
    return {
        listTicket: listTicket.data,
        search : isSearch,
        loadmore : false
    };
}