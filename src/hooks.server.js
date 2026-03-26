import { redirect } from '@sveltejs/kit';
import { userByTokenAPI } from '$lib/tools/tokenApi';
// import { ClientMenuAPI } from '$lib/tools/menuApi';
// import { userGroupAPI } from '$lib/tools/userGroupAPI';
// import { LangAPI } from '$lib/tools/langApi';
import {getUserCache, setUserCache} from '$lib/server/userCache'

const publicRoutes = [
	'/login',
	'/forgot-password',
	'/reset-password'
];

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {

	const userAgent = event.request.headers.get('user-agent') || '';
	const pathname = event.url.pathname;
	const sessionId = event.cookies.get('session_id');

	const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
	const isAsset = event.url.pathname.startsWith('/_app') || event.url.pathname.startsWith('/favicon.ico');
	const isPublic = publicRoutes.some(route => pathname.startsWith(route));
    const isApiRoute = pathname.startsWith('/api');

	if (!isMobile && !isAsset) {
        // Opsi A: Lempar ke halaman khusus "Mobile Only"
        // throw redirect(307, '/mobile-only'); 

        // Opsi B: Berikan respon teks sederhana
        return new Response('Akses ditolak. Aplikasi ini hanya dapat diakses melalui perangkat mobile.', {
            status: 403,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
    }

	// ✅ jika route public dan tidak login → langsung lanjut
	if (!sessionId && isPublic) {
		return resolve(event);
	}

	// ❌ jika bukan public dan tidak login → redirect
	if (!sessionId && !isPublic) {

		// jika request API
		if (isApiRoute) {
			return new Response(
				JSON.stringify({ error: 'Unauthorized' }),
				{
					status: 401,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		// jika request page
		throw redirect(303, '/login');
	}

	let isLoggedIn = false;

	if (sessionId) {

        let user = getUserCache(sessionId);

        if (!user) {

			const dataUser = await userByTokenAPI(
				{ token: sessionId },
				event.fetch
			);

			if (dataUser.error) {

				event.cookies.delete('session_id', { path: '/' });

				throw redirect(303, '/login');
			}

			user = dataUser.data;

			setUserCache(sessionId, user);
		}

        event.locals.user = user;

	}

	return resolve(event);
}