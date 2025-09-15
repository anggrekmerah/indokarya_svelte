import {getTicketStatusAPI, getTicketPriorityAPI} from '$lib/tools/clientApi.js'

export async function load({ locals, fetch }) {
  // Access session data or private APIs
  const ticketStatus = await getTicketStatusAPI({}, fetch);
  const ticketPriority = await getTicketPriorityAPI({}, fetch);

  return {
    dataTicketStatus : ticketStatus.data,
    dataTicketPriority : ticketPriority.data
  };
}