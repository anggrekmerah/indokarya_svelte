// import { totalTicket, avgClosedTicket, totalTicketPriority } from '$lib/tools/techdashboard';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, fetch, locals }) {
  // You can use fetch to call APIs or access database here
    console.log(locals.user)
    
    return {
        
    };
}