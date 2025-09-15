import { parse } from 'cookie';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    // 1. Get the cookies from the request headers
    const cookies = parse(event.request.headers.get('cookie') || '');

    // 2. Check for a session ID or token
    const sessionId = cookies.session_id;

    if (sessionId) {
        // In a real application, you would validate the session ID against a database
        // and fetch the corresponding user data. For this example, we'll use a mock user.
        console.log(`User with session ID ${sessionId} is logged in.`);
        
        event.locals.user = {
            id: '123',
            name: 'John Doe',
            isLoggedIn: true
        };
    } else {
        event.locals.user = null;
    }

    // 3. Resolve the request
    return resolve(event);
}