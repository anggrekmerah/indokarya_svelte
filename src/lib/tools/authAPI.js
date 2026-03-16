import {requestAPI} from './clientApi'

// Lang route
export async function forgotPassword(body, fetch) {

    const responseAPI = await requestAPI('POST','/auth/forgot-password', body, fetch) 

    return responseAPI;
    
}

export async function resetPassword(body, fetch) {

    const responseAPI = await requestAPI('POST','/auth/reset-password', body, fetch) 

    return responseAPI;
    
}

export async function validateResetPassword(body, fetch) {

    const responseAPI = await requestAPI('POST','/auth/validate-reset-password', body, fetch) 

    return responseAPI;
    
}