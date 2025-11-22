import {requestAPI} from './clientApi'

export async function readNotif(body, fetch) {

    const responseAPI = await requestAPI('PUT','/notif/read', body, fetch) 

    return responseAPI;
    
}

export async function total(body, fetch) {

    const responseAPI = await requestAPI('POST','/notif/total', body, fetch) 

    return responseAPI;
    
}

export async function getUnreadNotif(body, fetch) {

    const responseAPI = await requestAPI('POST','/notif/unread', body, fetch) 

    return responseAPI;
    
}