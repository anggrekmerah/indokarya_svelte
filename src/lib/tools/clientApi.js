import { error } from '@sveltejs/kit';
import { PRIVATE_KEY,BASE_URL_API } from '$env/static/private';
import jwt from 'jsonwebtoken';

async function defaultBodyRequest(body) {
    body.app = 'svelte'
    return { request : body , signature : '' };
} 

// async function generateSignature(body, fetch) {
//     const response = await fetch('/api/auth', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(body)
//     });

//     const data = await response.json();
//     base_url = data.baseURL
//     return data.signature;
// }

async function generateSignature(body) {

    const signature = jwt.sign(body, PRIVATE_KEY, { algorithm: 'RS256', expiresIn: '1m' });
    return signature
}

async function makeBody(body) {
    
    let BodyRequest = await defaultBodyRequest(body);
    let signature = await generateSignature(body);
        BodyRequest.signature = signature

    return BodyRequest

}

export async function requestAPI(method, endpoint, bodys, fetch) {

    const bodyReq = await makeBody(bodys)

    const url = BASE_URL_API + endpoint
    
    const responseAPI = await fetch( url , {
        // agent: agents,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyReq) // This is correct, it uses the prepared `body` argument.
    });
    console.log(responseAPI.text())
    // Check if the HTTP response status is in the 200-299 range.
    if (!responseAPI.ok) {
        // Attempt to parse the error message from the response body.
        // Use a try...catch block in case the body is not JSON.
        let errorData = {};
        try {
            errorData = await responseAPI.json();
        } catch (e) {
            // If the response is not JSON, use a generic message.
            errorData.message = responseAPI.statusText;
        }

        // Use SvelteKit's built-in `error` function to handle the issue.
        // It will redirect to the nearest `+error.svelte` page.
        error(responseAPI.status, `API Error: ${errorData.message || 'Unknown error'}`);
    }

    // If the response is ok, parse and return the JSON.
    const resJson = await responseAPI.json();
    return resJson;

}
