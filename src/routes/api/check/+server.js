import { json } from '@sveltejs/kit';
import {checkAPI} from '$lib/tools/check'
// The POST function handles all incoming POST requests to this endpoint.
/**
 * Handle POST request untuk menandai notifikasi sebagai 'read'.
 * @param {import('./$types').RequestHandler} request
 * @param {import('./$types').Locals} locals - Asumsi user data ada di locals
 */

export async function POST({ request, fetch, locals }) {
    const check = await checkAPI( fetch)

    return json(check)
}

