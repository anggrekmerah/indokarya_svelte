import {getTicketStatusAPI, ticketTotalAPI} from '$lib/tools/ticketApi'
import {getTicketPriorityAPI} from '$lib/tools/priorityApi'

export async function load({ locals, fetch }) {
  // Access session data or private APIs
  const ticketStatus = await getTicketStatusAPI({}, fetch);
  const ticketPriority = await getTicketPriorityAPI({}, fetch);
  const ticketTotal = await ticketTotalAPI({ID:locals.user.id}, fetch)
  
  return {
    dataTicketStatus : ticketStatus.data,
    dataTicketPriority : ticketPriority.data,
    dataTicketTotal : ticketTotal.data
  };
}