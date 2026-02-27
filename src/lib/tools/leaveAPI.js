import {requestAPI} from './clientApi'

// Lang route
export async function all(body, fetch) {

    const responseAPI = await requestAPI('POST','/leave/get', body, fetch) 

    return responseAPI;
    
}

export async function leaveRequest(body, fetch) {

    const responseAPI = await requestAPI('POST','/leave/leave-request', body, fetch) 

    return responseAPI;
    
}

export async function listPagination(body, fetch) {

    const responseAPI = await requestAPI('POST','/leave/list-pagination', body, fetch) 

    return responseAPI;
    
}