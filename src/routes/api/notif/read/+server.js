import { json } from '@sveltejs/kit';
import {readNotif} from '$lib/tools/notifAPI.js'
// The POST function handles all incoming POST requests to this endpoint.
/**
 * Handle POST request untuk menandai notifikasi sebagai 'read'.
 * @param {import('./$types').RequestHandler} request
 * @param {import('./$types').Locals} locals - Asumsi user data ada di locals
 */

export async function POST({ request, fetch, locals }) {
    const data = await request.json();
    console.log(data)    
    
    const detailTicket = await readNotif({ID:locals.user.id, id_notif: data.id}, fetch)

    return json(detailTicket)
}

