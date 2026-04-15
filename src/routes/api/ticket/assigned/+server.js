import { json } from '@sveltejs/kit';
import { getTicketAssign } from '$lib/tools/ticketApi';

export async function POST({ request, fetch, locals }) {
    const data = await request.json();
    
    // --- CRITICAL FIX: Merge user ID with all client-side data (including filters) ---
    const payload = {
        ID: locals.user.id,
        ...data // This spreads offset, status, priority, and all other filters into the payload
    };

    const detailTicket = await getTicketAssign(payload, fetch);
        
    return json(detailTicket);
}