
import { all, leaveRequest, listPagination } from '$lib/tools/leaveAPI'
import { fail, redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, fetch, locals }) {
    // You can use fetch to call APIs or access database here
    
    let returnData = {}

    const allLeaves = await all({}, fetch)
    console.log(allLeaves)
    returnData.allLeaves = allLeaves.data

    const initialSubmissions = await listPagination({user_id:locals.user.id}, fetch);
    returnData.initialSubmissions = initialSubmissions.data;

    console.log(returnData)

    return returnData;
}

/** @type {import('./$types').Actions} */
export const actions = {
    ajukanCuti: async ({ request, fetch, locals }) => {
        const data = await request.formData();

        const jenis_cuti_id = data.get('jenis_cuti_id');
        const tanggal_mulai = data.get('tanggal_mulai');
        const tanggal_selesai = data.get('tanggal_selesai');
        const alasan = data.get('alasan');
        
        if (!jenis_cuti_id || !tanggal_mulai || !tanggal_selesai || !alasan) {
            return fail(400, { 
                message: 'Semua field wajib diisi!', 
                missing: true 
            });
        }

        try {
            const response = await leaveRequest({
                user_id : locals.user.id,
                leave_type : jenis_cuti_id,
                start_date : tanggal_mulai,
                end_date : tanggal_selesai,
                reason : alasan
            }, fetch);
            
            let msg = response.message ?? 'Gagal buat cuti.'
            if (response.error) return fail(500, { message: msg });
            return { success: true  };
        } catch (error) {
            return fail(500, { message: 'Terjadi kesalahan sistem.' });
        }
    }
};