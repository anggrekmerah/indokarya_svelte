import {requestAPI} from './clientApi'

// Token route
export async function loginAPI(body, fetch) {

    const responseAPI = await requestAPI('POST','/token/login', body, fetch) 

    return responseAPI
    
}

// Token route
export async function userByTokenAPI(body, fetch) {

    const responseAPI = await requestAPI('POST','/token/by-token', body, fetch) 

    return responseAPI
    
}