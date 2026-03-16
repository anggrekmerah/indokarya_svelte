import { getTicketStatusHistoryAPI, ticketTotalAPI, getTicketStatusActiveAPI } from '$lib/tools/ticketApi'
import { readNotif, getUnreadNotif, total } from '$lib/tools/notifAPI.js'

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, fetch, parent }) {
    // You can use fetch to call APIs or access database here
    
    const parentData = await parent()
    const user = parentData.user

    const ticketTotal = await ticketTotalAPI({ID:user.id}, fetch)
    const listNotif = await getUnreadNotif({ID:user.id}, fetch)
    const totalNotif = await total({ID:user.id}, fetch)
    console.log('ticketTotal')
    console.log(ticketTotal)
    return {
        userLang : parentData.userLang.lang
        ,users : user
        ,group : parentData.group[0].group_name
        ,dataTicketTotal : ticketTotal.data
        ,dataTotalNotif : totalNotif.data ?? 0
        ,dataListNotif: listNotif.data.map(n => {
      
            let parsedPayload;

            // Cek apakah content_payload perlu di-parse atau tidak
            if (typeof n.content_payload === 'string') {
                try {
                    parsedPayload = JSON.parse(n.content_payload);
                } catch (e) {
                    console.error("Gagal parse JSON:", n.content_payload);
                    parsedPayload = {}; // fallback jika string ternyata bukan JSON valid
                }
            } else {
                // Jika sudah berupa object (ini yang terjadi sekarang)
                parsedPayload = n.content_payload || {};
            }    
            // 2. Tambahkan (Inject) id_notif ke dalam objek payload
            parsedPayload.id_notif = n.id_notif;

            // 3. Kembalikan objek notifikasi dengan payload yang sudah diperkaya
            return {
                ...n, // Menyertakan field lain dari notifikasi (type, status, created_at, dll.)
                content_payload: parsedPayload
            };
        })
    }
}