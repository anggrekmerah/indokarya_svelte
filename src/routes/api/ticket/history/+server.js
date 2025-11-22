import { json } from '@sveltejs/kit';
import { getTicketHistory } from '$lib/tools/ticketApi';
// The POST function handles all incoming POST requests to this endpoint.
/**
 * Handle POST request untuk menandai notifikasi sebagai 'read'.
 * @param {import('./$types').RequestHandler} request
 * @param {import('./$types').Locals} locals - Asumsi user data ada di locals
 */

export async function POST({ request, fetch, locals }) {
    const data = await request.json();
    
    const detailTicket = await getTicketHistory(
        {ID:locals.user.id, offset : data.offset}, fetch)

    return json(detailTicket)
}

