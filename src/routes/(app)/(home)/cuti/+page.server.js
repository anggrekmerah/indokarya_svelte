
import { all, leaveRequest, listPagination } from '$lib/tools/leaveAPI'
import { allCuti } from '$lib/tools/cuti'
import { fail, redirect } from '@sveltejs/kit';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, fetch, locals, parent }) {
    // You can use fetch to call APIs or access database here
    const parentData = await parent()
    let returnData = {}

    const allLeaves = await all({}, fetch)
    returnData.allLeaves = allLeaves.data

    const initialSubmissions = await listPagination({user_id:parentData.user.id}, fetch);
    returnData.initialSubmissions = initialSubmissions.data;

    const allcuti = await allCuti({}, fetch)
    returnData.allcuti = allcuti.data

    console.log(returnData)

    return returnData;
}

/** @type {import('./$types').Actions} */
export const actions = {
    ajukanCuti: async ({ request, fetch, locals }) => {

        const data = await request.formData();

        const jenis_cuti_id = data.get('jenis_cuti_id');
        const tgl_mulai_raw = data.get('tanggal_mulai'); // Bisa berupa 'YYYY-MM-DD' atau 'YYYY-MM-DDTHH:mm'
        const tgl_selesai_raw = data.get('tanggal_selesai');
        const alasan = data.get('alasan');
        const file = data.get('attachment');

        if (!jenis_cuti_id || !tgl_mulai_raw || !tgl_selesai_raw || !alasan) {
            return fail(400, { message: 'Semua field wajib diisi!' });
        }

        // --- Logic Pemisahan Date & Time ---
        const splitDateTime = (rawVal) => {
            if (rawVal.includes('T')) {
                const [d, t] = rawVal.split('T');
                return { date: d, time: t };
            }
            return { date: rawVal, time: null };
        };

        const start = splitDateTime(tgl_mulai_raw);
        const end = splitDateTime(tgl_selesai_raw);

        // --- Perhitungan Total Hari (Sederhana) ---
        const d1 = new Date(start.date);
        const d2 = new Date(end.date);
        const diffTime = Math.abs(d2 - d1);
        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        // --- Simpan File ke /static/uploads ---
        let fileNameDb = null;
        if (file && file.size > 0) {
            try {
                const uploadDir = join(process.cwd(), 'static', 'uploads');
                if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

                const cleanFileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
                const fullPath = join(uploadDir, cleanFileName);
                
                const buffer = Buffer.from(await file.arrayBuffer());
                writeFileSync(fullPath, buffer);
                
                fileNameDb = cleanFileName; // Simpan nama file saja atau path lengkap sesuai kebutuhan
            } catch (err) {
                return fail(500, { message: 'Gagal simpan file.' });
            }
        }

        try {
            // Sesuaikan payload dengan struktur tabel t_leave_requests
            const payload = {
                user_id: locals.user.id,
                leave_type: jenis_cuti_id,
                start_date: start.date,
                start_time: start.time,
                end_date: end.date,
                end_time: end.time,
                reason: alasan,
                attachment_file: fileNameDb,
                total_days: totalDays,
                status: 'pending'
            };

            const response = await leaveRequest(payload, fetch);
            
            if (response.error) return fail(500, { message: response.message });
            return { success: true };
        } catch (error) {
            return fail(500, { message: 'Kesalahan sistem API.' });
        }
    }
};