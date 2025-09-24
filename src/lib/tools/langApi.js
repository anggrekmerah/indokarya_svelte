import {requestAPI} from './clientApi'

// Lang route
export async function LangAPI(body, fetch) {

    const responseAPI = await requestAPI('POST','/lang/get-active', body, fetch) 

    return responseAPI;
    
}