import { json } from '@sveltejs/kit';
import { getTicketAssign } from '$lib/tools/ticketApi';

export async function POST({ request, fetch, locals }) {
    console.log('API detailTicket');
    const data = await request.json();
    console.log(data);
    
    // --- CRITICAL FIX: Merge user ID with all client-side data (including filters) ---
    const payload = {
        ID: locals.user.id,
        ...data // This spreads offset, status, priority, and all other filters into the payload
    };

    const detailTicket = await getTicketAssign(payload, fetch);
        
    console.log(detailTicket);
    return json(detailTicket);
}