import { getTicketAssign, ticketDetailAPI } from '$lib/tools/ticketApi';
import { todayAttendance } from '$lib/tools/attendenceAPI'
import { fail, redirect } from '@sveltejs/kit';
import { tick } from 'svelte';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url, fetch, locals, parent }) {
  
    const parentData = await parent()

    const getTodayAttendance = await todayAttendance({user_id : parentData.user.id}, fetch)
    let hasCheckedIn = !!getTodayAttendance && getTodayAttendance.data !== null

    if(!hasCheckedIn){
        // If the process is successful, redirect the user
        const message = encodeURIComponent("Anda belum absen masuk hari ini!");
        throw redirect(302, `/home?error=${message}`);
    }

    // You can use fetch to call APIs or access database here
    const idUser = parentData.user.id
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
        
    listTicket.data.items = await Promise.all(
        listTicket.data.items.map(async (ticket) => {
            const detailTicket = await ticketDetailAPI(
                {
                    ID: idUser,
                    id_ticket: ticket.id_ticket
                },
                fetch
            );

            return {
                ...ticket,
                detail: detailTicket.data[0]
            };
        })
    );

    return {
        listTicket: listTicket.data,
        search : isSearch,
        loadmore : false
    };
}