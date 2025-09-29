import {getTicketStatusHistoryAPI, ticketTotalAPI, getTicketStatusActiveAPI} from '$lib/tools/ticketApi'
import {getTicketPriorityAPI} from '$lib/tools/priorityApi'

export async function load({ locals, fetch, url }) {

  const status = url.searchParams.get('status') ?? ''
  console.log(status)
  // The full path is available on the url object
  const fullPath = url.pathname;
  
  // Split the path to get segments
  const segments = fullPath.split('/').filter(segment => segment !== '');

  console.log(segments);
  
  // Access session data or private APIs
 const ticketStatus = segments[0] === 'home' 
    ? await getTicketStatusActiveAPI({}, fetch) 
    : await getTicketStatusHistoryAPI({}, fetch);

  const ticketPriority = await getTicketPriorityAPI({}, fetch);
  const ticketTotal = await ticketTotalAPI({ID:locals.user.id}, fetch)
  
  return {
    dataTicketStatus : ticketStatus.data,
    dataTicketPriority : ticketPriority.data,
    dataTicketTotal : ticketTotal.data,
    segment : segments[0],
    id_status:status
  };
}