import {requestAPI} from './clientApi'

// Lang route
export async function sendLocationAPI(body, fetch) {

    const responseAPI = await requestAPI('POST','/location/create', body, fetch) 

    return responseAPI;
    
}
