import { getTicketStatusHistoryAPI, ticketTotalAPI, getTicketStatusActiveAPI } from '$lib/tools/ticketApi'
import { getTicketPriorityAPI } from '$lib/tools/priorityApi'
import { readNotif, getUnreadNotif, total } from '$lib/tools/notifAPI.js'
import { fail } from '@sveltejs/kit';

export async function load({ locals, fetch, url }) {

  // The full path is available on the url object
  const fullPath = url.pathname;
  
  // Split the path to get segments
  const segments = fullPath.split('/').filter(segment => segment !== '');

  console.log(segments);
  
  // Access session data or private APIs
 const ticketStatus = segments[0] === 'task' 
    ? await getTicketStatusActiveAPI({}, fetch) 
    : await getTicketStatusHistoryAPI({}, fetch);

  const ticketPriority = await getTicketPriorityAPI({}, fetch);
  const ticketTotal = await ticketTotalAPI({ID:locals.user.id}, fetch)
  const listNotif = await getUnreadNotif({ID:locals.user.id}, fetch)
  const totalNotif = await total({ID:locals.user.id}, fetch)
  console.log('listNotif')
  console.log(listNotif)
  return {
    dataTicketStatus : ticketStatus.data,
    dataTicketPriority : ticketPriority.data,
    dataTicketTotal : ticketTotal.data,
    segment : segments[0],
    dataTotalNotif : totalNotif.data ?? 0,
    dataListNotif: listNotif.data.map(n => {
      
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
  };
}
