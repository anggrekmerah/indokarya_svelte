import { json } from '@sveltejs/kit';
import {ticketLockedAPI} from '$lib/tools/ticketApi'
// The POST function handles all incoming POST requests to this endpoint.
export async function POST({ request, fetch, locals }) {
    const body = await request.blob();
    const data = JSON.parse(await body.text());
    data.ID = locals.user.id
    
    const detailTicket = await ticketLockedAPI(data, fetch)

    return json(detailTicket)
}