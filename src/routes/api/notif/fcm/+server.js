import { json } from '@sveltejs/kit';
import {userChangeFcmToken} from '$lib/tools/userApi'
// The POST function handles all incoming POST requests to this endpoint.
/**
 * Handle POST request untuk menandai notifikasi sebagai 'read'.
 * @param {import('./$types').RequestHandler} request
 * @param {import('./$types').Locals} locals - Asumsi user data ada di locals
 */

export async function POST({ request, fetch, locals }) {
    const data = await request.json();  
    console.log(locals.user)
    console.log(data)
    const detailTicket = await userChangeFcmToken(
        {
            ID: locals.user.id, 
            id_user: locals.user.id, 
            fcm_token: data.token
        }, 
        fetch)

    return json(detailTicket)
}

