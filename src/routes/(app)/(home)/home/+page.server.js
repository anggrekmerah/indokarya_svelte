import { totalTicket, avgClosedTicket, totalTicketPriority, attendance } from '$lib/tools/techdashboard';
import { checkIn, checkOut, todayAttendance, checkTodayAttendance } from '$lib/tools/attendenceAPI'
import { mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fail, redirect } from '@sveltejs/kit';
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_ID, OFFICELAT, OFFICELONG } from '$env/static/private';


/** @type {import('./$types').PageServerLoad} */
export async function load({ params, fetch, locals }) {
  // You can use fetch to call APIs or access database here
    
    let returnData = {
        data_totalClosed    :null
        ,data_avgClosed     :null
        ,data_totalOpen     :null
        ,data_totalLow      :null
        ,data_totalMedium   :null
        ,data_totalUrgent   :null
        ,data_attendance    :null
    };

    if(locals.user.work_base == 'office') {
        returnData = {}
    } else {
        
      const totalClosed = await totalTicket({ID : locals.user.id, id_status: 3}, fetch)
      const avgClosed = await avgClosedTicket({ID : locals.user.id, id_status: 3}, fetch)
      const totalOpen = await totalTicket({ID : locals.user.id, id_status: 1}, fetch)
      const totalLow = await totalTicketPriority({ID : locals.user.id, id_priority: 1}, fetch)
      const totalMedium = await totalTicketPriority({ID : locals.user.id, id_priority: 2}, fetch)
      const totalUrgent = await totalTicketPriority({ID : locals.user.id, id_priority: 3}, fetch)
      returnData = {
          data_totalClosed : totalClosed.data[0]
        ,data_avgClosed : avgClosed.data[0]
        ,data_totalOpen : totalOpen.data[0]
        ,data_totalLow : totalLow.data[0]
        ,data_totalMedium : totalMedium.data[0]
        ,data_totalUrgent : totalUrgent.data[0]
      }
    } 

    // const getTodayAttendance = await todayAttendance({user_id : locals.user.id}, fetch)
    const getcheckTodayAttendance = await checkTodayAttendance({user_id : locals.user.id}, fetch)
    const getattendance = await attendance({user_id : locals.user.id}, fetch)
    console.log(getattendance.data.totalSisaCuti)
    return {
        ...returnData,
        // todayAttendance: getTodayAttendance || null, // Pastikan tidak undefined
        checkTodayAttendance: getcheckTodayAttendance || null,
        mapsKey: GOOGLE_MAPS_API_KEY,
        mapsId: GOOGLE_MAPS_ID,
        officelat: OFFICELAT,
        officelong: OFFICELONG,
        attendances: getattendance || null
    };
}

/**
 * Fungsi pembantu untuk menyimpan file foto ke server
 * @param {File} photo - Objek file dari formData
 * @returns {Promise<string>} - Mengembalikan path file yang disimpan
 */
async function saveAttendancePhoto(photo) {
    const directoryPath = './static/absen/';
    // Membuat direktori jika belum ada
    mkdirSync(directoryPath, { recursive: true });

    const extension = extname(photo.name);
    const uniqueFilename = `${uuidv4()}${extension}`;
    const filePath = `${directoryPath}${uniqueFilename}`;

    // Menulis file ke sistem
    await writeFile(filePath, Buffer.from(await photo.arrayBuffer()));
    return filePath;
}

/** @type {import('./$types').Actions} */
export const actions = {
    absenMasuk: async ({ request, fetch, locals }) => {
        const data = await request.formData();
        const photo = data.get('photo');
        
        if (!photo || photo.size === 0) {
            return fail(400, { message: 'Foto tidak ditemukan.' });
        }

        try {
            const filePath = await saveAttendancePhoto(photo);
            const response = await checkIn({
                user_id: locals.user.id, 
                check_in_location: `${data.get('latitude')} ${data.get('longitude')}`,
                check_in_photo: filePath,
                attendance_mode: data.get('attendance_mode')
            }, fetch);
            
            if (response.error) return fail(500, { message: response.message, fromAction:'checkin' });
            return { success: true , fromAction:'checkin' };
        } catch (error) {
            return fail(500, { message: 'Terjadi kesalahan sistem.' + error });
        }
    },

    absenKeluar: async ({ request, fetch, locals }) => {
        const data = await request.formData();
        const photo = data.get('photo');

        if (!photo || photo.size === 0) {
            return fail(400, { message: 'Foto tidak ditemukan.' });
        }

        try {
            const filePath = await saveAttendancePhoto(photo);
            const response = await checkOut({
                user_id: locals.user.id, 
                check_out_location: `${data.get('latitude')} ${data.get('longitude')}`,
                check_out_photo: filePath
            }, fetch);

            if (response.error) return fail(500, { message: 'Gagal update absen di server.', fromAction:'checkout' });
            return { success: true, fromAction:'checkout' };
        } catch (error) {
            return fail(500, { message: 'Terjadi kesalahan sistem.' });
        }
    }
};