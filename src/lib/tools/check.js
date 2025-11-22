import {requestAPI} from './clientApi'

// Lang route
export async function checkAPI(fetch) {

    const responseAPI = await requestAPI('POST','/check', {}, fetch) 

    return responseAPI;
    
}