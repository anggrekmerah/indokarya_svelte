import { json } from '@sveltejs/kit';
import {listPagination} from '$lib/tools/leaveAPI'

/**
 * Handle POST request untuk menandai notifikasi sebagai 'read'.
 * @param {import('./$types').RequestHandler} request
 * @param {import('./$types').Locals} locals - Asumsi user data ada di locals
 */
export async function POST({ request, locals, fetch }) {
    const body = await request.json(); // Mengambil JSON dari frontend
    
    // Kirim ke backend controller Anda
    // Pastikan menyertakan user_id dari locals untuk keamanan
    const response = await listPagination ({
                user_id: locals.user.id,
                page: body.page,
                limit: body.limit,
                status: body.status
            }, fetch)
    
    return json(response.data || []);
}