import { json } from '@sveltejs/kit';
import {sendLocationAPI} from '$lib/tools/location'
// The POST function handles all incoming POST requests to this endpoint.
/**
 * Handle POST request untuk menandai notifikasi sebagai 'read'.
 * @param {import('./$types').RequestHandler} request
 * @param {import('./$types').Locals} locals - Asumsi user data ada di locals
 */

export async function POST({ request, fetch, locals }) {
    const data = await request.json();
    console.log(data)    
    const payload = {ID:locals.user.id, lat: data.lat, lng: data.lng, id_ticket:data.id_ticket}
    const sendLocation = await sendLocationAPI(payload, fetch)

    return json(sendLocation)
}

