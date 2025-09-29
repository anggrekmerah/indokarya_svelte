import {requestAPI} from './clientApi'

// Ticket route
export async function getTicketStatusAPI(body, fetch) {

    const responseAPI = await requestAPI('POST','/ticket-status/get', body, fetch) 

    return responseAPI;
    
}

export async function getTicketStatusActiveAPI(body, fetch) {

    const responseAPI = await requestAPI('POST','/ticket-status/active', body, fetch) 

    return responseAPI;
    
}

export async function getTicketStatusHistoryAPI(body, fetch) {

    const responseAPI = await requestAPI('POST','/ticket-status/history', body, fetch) 

    return responseAPI;
    
}

export async function getTicketAssign(body, fetch) {

    const responseAPI = await requestAPI('POST','/ticket/assign', body, fetch) 

    return responseAPI;
    
}

export async function ticketCheckInAPI(body, fetch) {

    const responseAPI = await requestAPI('POST','/ticket/checkin', body, fetch) 

    return responseAPI;
    
}

export async function ticketCheckOutAPI(body, fetch) {

    const responseAPI = await requestAPI('POST','/ticket/checkout', body, fetch) 

    return responseAPI;
    
}

export async function ticketDetailAPI(body, fetch) {

    const responseAPI = await requestAPI('POST','/ticket/detail', body, fetch) 

    return responseAPI;
    
}

export async function ticketTotalAPI(body, fetch) {

    const responseAPI = await requestAPI('POST','/ticket/total', body, fetch) 

    return responseAPI;
    
}

export async function ticketLockedAPI(body, fetch) {

    const responseAPI = await requestAPI('POST','/ticket/locked', body, fetch) 

    return responseAPI;
    
}

export async function ticketRequestUnlockAPI(body, fetch) {

    const responseAPI = await requestAPI('POST','/ticket/request_unlock', body, fetch) 

    return responseAPI;
    
}