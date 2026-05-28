import { monthlyAttendance } from '$lib/tools/attendenceAPI';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, fetch, url, parent }) {
    const parentData = await parent();
    
    // Tangkap nilai parameter dari URL (?month=XX). Default ke bulan sekarang.
    const now = new Date();
    const currentMonthStr = String(now.getMonth() + 1).padStart(2, '0');
    const selectedMonth = url.searchParams.get('month') || currentMonthStr;
    const selectedYear = now.getFullYear().toString();

    let returnData = {
        selectedMonth,
        selectedYear
    };

    // Sesuaikan payload request agar sesuai dengan struktur validasi backend Express: req.body.request
    const payload = {
            user_id: parentData.user.id,
            month: selectedMonth,
            year: selectedYear
        };

    // Panggil API backend pembawa payload baru
    const getMonthlyAttendance = await monthlyAttendance(payload, fetch);
    returnData.monthlyAttendance = getMonthlyAttendance;

    return returnData;
}