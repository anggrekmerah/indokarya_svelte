import {requestAPI} from './clientApi'

// Menu route
export async function ClientMenuAPI(body, fetch) {

    const responseAPI = await requestAPI('POST', '/menu/get-client', body, fetch) 

    return responseAPI;
    
}


