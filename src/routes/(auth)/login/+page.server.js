import { fail, redirect } from '@sveltejs/kit';
import { PRIVATE_KEY } from '$env/static/private';
import jwt from 'jsonwebtoken';

/** @type {import('./$types').Actions} */
export const actions = {
    login: async ({ request, cookies }) => {
        const data = await request.formData();
        const username = data.get('email');
        const password = data.get('password');
        
        // Simple validation to ensure fields are not empty
        if (!username || !password) {
            return fail(400, { success: false, message: 'Username and password are required.' });
        }

        const originalString = username + ':' + password;
        
        let encodedString = btoa(originalString);

        const loginData = { request : { app : 'svelte', auth : encodedString } , signature : '' };
        const token = jwt.sign(loginData.request, PRIVATE_KEY, { algorithm: 'RS256', expiresIn: '1m' });
        loginData.signature = token
        
        const response = await fetch('http://127.0.0.1:3333/token/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

        const dataLogin = await response.json();
            
        // Simulate a successful login with hardcoded credentials
        if (dataLogin) {
            // Set a cookie to remember the user. The cookie is named 'session_id' and
            // its value is an arbitrary string. In a real app, this would be a secure token.
            cookies.set('session_id', token, {
                path: '/', // The cookie is available to all routes
                httpOnly: true, // The cookie can't be accessed by client-side JavaScript
                sameSite: 'strict', // Protects against CSRF attacks
                secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
                maxAge: 60 * 60 * 24 // Cookie expires in 1 day
            });

            // Redirect the user to the home page after a successful login.
            // The 303 status code is a "See Other" redirect, which is the standard
            // for form submissions that change data.
            throw redirect(303, '/home');
        } else {
            // If credentials are not valid, return a failure with a message.
            return fail(400, { success: false, message: dataLogin.message });
        }
    },
    logout: async ({ cookies }) => {
        // Clear the session cookie to log the user out.
        cookies.delete('session_id', { path: '/' });

        // Redirect to the login page with a success message in the URL
        throw redirect(303, '/login?loggedOut=true');
    }
};