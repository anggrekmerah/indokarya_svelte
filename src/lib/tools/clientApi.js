import { error } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';


let base_url



async function defaultBodyRequest(body) {
    body.app = 'svelte'
    return { request : body , signature : '' };
}

async function generateSignature(body, fetch) {
    const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    const data = await response.json();
    base_url = data.baseURL
    return data.signature;
}

async function makeBody(body, fetch) {
    
    let BodyRequest = await defaultBodyRequest(body);
    let signature = await generateSignature(body, fetch);
        BodyRequest.signature = signature

    return BodyRequest

}

async function request(endpoint, body, fetch) {

    const responseAPI = await fetch( base_url + endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body) // This is correct, it uses the prepared `body` argument.
    });
    // console.log(body)
    // Check if the HTTP response status is in the 200-299 range.
    // if (!responseAPI.ok) {
    //     // Attempt to parse the error message from the response body.
    //     // Use a try...catch block in case the body is not JSON.
    //     let errorData = {};
    //     try {
    //         errorData = await responseAPI.json();
    //     } catch (e) {
    //         // If the response is not JSON, use a generic message.
    //         errorData.message = responseAPI.statusText;
    //     }

    //     // Use SvelteKit's built-in `error` function to handle the issue.
    //     // It will redirect to the nearest `+error.svelte` page.
    //     // error(responseAPI.status, `API Error: ${errorData.message || 'Unknown error'}`);
    // }

    // If the response is ok, parse and return the JSON.
    const resJson = await responseAPI.json();
    return resJson;

}

async function requestAPIWithBody(endpoint, body, fetch) {

    const bodyReq = await makeBody(body, fetch)

    return await request( endpoint, bodyReq, fetch);
    
}

export async function loginAPI(body, fetch) {

    const bodyReq = await makeBody(body, fetch)
    
    const responseAPI = await request('/token/login', bodyReq, fetch) 
   
    const sessionID = await generateSessionId()

    return {response : responseAPI, token : sessionID };
    
}

export async function getLangAPI(body, fetch) {

    const responseAPI = await requestAPIWithBody('/lang/get-active', body, fetch) 

    return responseAPI;
    
}

export async function getTicketStatusAPI(body, fetch) {

    const responseAPI = await requestAPIWithBody('/ticket-status/get', body, fetch) 

    return responseAPI;
    
}

export async function getTicketPriorityAPI(body, fetch) {

    const responseAPI = await requestAPIWithBody('/priority/get', body, fetch) 

    return responseAPI;
    
}
