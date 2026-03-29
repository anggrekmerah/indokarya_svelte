import {requestAPI} from './clientApi'

// Lang route
export async function allCuti(body, fetch) {

    const responseAPI = await requestAPI('POST','/cuti/get-all', body, fetch) 

    return responseAPI;
    
}