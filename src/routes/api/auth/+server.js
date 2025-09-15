// src/routes/api/auth/+server.js
import { json } from '@sveltejs/kit';
import { PRIVATE_KEY,BASE_URL_API } from '$env/static/private';
import jwt from 'jsonwebtoken';

// The POST function handles all incoming POST requests to this endpoint.
export async function POST({ request }) {
    const body = await request.json();
    
    // Server-side function to generate the JWT signature.
    const signature = jwt.sign(body, PRIVATE_KEY, { algorithm: 'RS256', expiresIn: '1m' });

    return json({
        signature: signature,
        baseURL: BASE_URL_API
    });
}