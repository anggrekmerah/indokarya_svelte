import {requestAPI} from './clientApi'

export async function totalTicket(body, fetch) {

    const responseAPI = await requestAPI('POST','/tech-dashboard/total-ticket', body, fetch) 

    return responseAPI;
    
}

export async function totalTicketPriority(body, fetch) {

    const responseAPI = await requestAPI('POST','/tech-dashboard/total-ticket-priority', body, fetch) 

    return responseAPI;
    
}

export async function avgClosedTicket(body, fetch) {

    const responseAPI = await requestAPI('POST','/tech-dashboard/total-avg-ticket', body, fetch) 

    return responseAPI;
    
}

export async function attendance(body, fetch) {

    const responseAPI = await requestAPI('POST','/tech-dashboard/get-dash-user', body, fetch) 

    return responseAPI;
    
}
