import {requestAPI} from './clientApi'

// Priority route
export async function getTicketPriorityAPI(body, fetch) {

    const responseAPI = await requestAPI('POST', '/priority/get', body, fetch) 

    return responseAPI;
    
}