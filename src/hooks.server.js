import { parse } from 'cookie';
import {userByTokenAPI} from '$lib/tools/tokenApi'
import {ClientMenuAPI} from '$lib/tools/menuApi'
import {userGroupAPI} from '$lib/tools/userGroupAPI'
import {LangAPI} from '$lib/tools/langApi'
import { redirect } from '@sveltejs/kit';

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
        
        const dataUser = await userByTokenAPI({token: sessionId},event.fetch)
        
        if(!dataUser.error) {
            
            const userMenu = await ClientMenuAPI({email:dataUser.data.email}, event.fetch)
            const userLang = await LangAPI({id_user:dataUser.data.id }, event.fetch)
            const userGroup = await userGroupAPI({ID:dataUser.data.id }, event.fetch)

            event.locals.user = dataUser.data
            event.locals.userMenu = userMenu.data
            event.locals.userLang = userLang.data
            event.locals.userGroup = userGroup.data

        } else {

            event.cookies.delete('session_id', { path: '/' });
            
            // Redirect to the login page with a success message in the URL
            throw redirect(303, '/login?loggedOut=true');
                       
        }
        

    } else {
        event.locals.user = null;
        event.locals.userMenu = null;
        event.locals.userLang = null
    }

    // 3. Resolve the request
    return await resolve(event);
}