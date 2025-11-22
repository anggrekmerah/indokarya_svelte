import { totalTicket, avgClosedTicket, totalTicketPriority } from '$lib/tools/techdashboard';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, fetch, locals }) {
  // You can use fetch to call APIs or access database here
    console.log(locals.user)
    const totalClosed = await totalTicket({ID : locals.user.id, id_status: 3}, fetch)
    const avgClosed = await avgClosedTicket({ID : locals.user.id, id_status: 3}, fetch)
    const totalOpen = await totalTicket({ID : locals.user.id, id_status: 1}, fetch)
    const totalLow = await totalTicketPriority({ID : locals.user.id, id_priority: 1}, fetch)
    const totalMedium = await totalTicketPriority({ID : locals.user.id, id_priority: 2}, fetch)
    const totalUrgent = await totalTicketPriority({ID : locals.user.id, id_priority: 3}, fetch)
    
    return {
        data_totalClosed : totalClosed.data[0]
       ,data_avgClosed : avgClosed.data[0]
       ,data_totalOpen : totalOpen.data[0]
       ,data_totalLow : totalLow.data[0]
       ,data_totalMedium : totalMedium.data[0]
       ,data_totalUrgent : totalUrgent.data[0]
    };
}