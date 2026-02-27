import {requestAPI} from './clientApi'

// Lang route
export async function checkIn(body, fetch) {

    const responseAPI = await requestAPI('POST','/attendence/check-in', body, fetch) 

    return responseAPI;
    
}

export async function checkOut(body, fetch) {

    const responseAPI = await requestAPI('POST','/attendence/check-out', body, fetch) 

    return responseAPI;
    
}

export async function todayAttendance(body, fetch) {

    const responseAPI = await requestAPI('POST','/attendence/get-today-attendance', body, fetch) 

    return responseAPI;
    
}

export async function checkTodayAttendance(body, fetch) {

    const responseAPI = await requestAPI('POST','/attendence/check-today-attendance', body, fetch) 

    return responseAPI;
    
}

export async function monthlyAttendance(body, fetch) {

    const responseAPI = await requestAPI('POST','/attendence/get-monthly-attendance', body, fetch) 

    return responseAPI;
    
}