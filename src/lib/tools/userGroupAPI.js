import {requestAPI} from './clientApi'

// Lang route
export async function userGroupAPI(body, fetch) {

    const responseAPI = await requestAPI('POST','/user-group/detail', body, fetch) 

    return responseAPI;
    
}