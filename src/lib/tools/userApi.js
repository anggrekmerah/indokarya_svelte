import {requestAPI} from './clientApi'

// Lang route
export async function userChangePasswordAPI(body, fetch) {

    const responseAPI = await requestAPI('PUT','/user/change-password', body, fetch) 

    return responseAPI;
    
}

export async function userChangeFcmToken(body, fetch) {

    const responseAPI = await requestAPI('PUT','/user/update', body, fetch) 

    return responseAPI;
    
}
