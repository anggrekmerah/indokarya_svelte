import {requestAPI} from './clientApi'

// Lang route
export async function userChangePasswordAPI(body, fetch) {

    const responseAPI = await requestAPI('PUT','/user/change-password', body, fetch) 

    return responseAPI;
    
}
