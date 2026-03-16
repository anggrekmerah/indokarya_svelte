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

	const pathname = event.url.pathname;
	const sessionId = event.cookies.get('session_id');

	const isPublic = publicRoutes.some(route => pathname.startsWith(route));
    const isApiRoute = pathname.startsWith('/api');

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

		// const dataUser = await userByTokenAPI({ token: sessionId }, event.fetch);

		// if (!dataUser.error) {

		// 	const [userMenuResult, userLangResult, userGroupResult] = await Promise.all([
		// 		ClientMenuAPI({ email: dataUser.data.email }, event.fetch),
		// 		LangAPI({ id_user: dataUser.data.id }, event.fetch),
		// 		userGroupAPI({ id_user: dataUser.data.id }, event.fetch),
		// 	]);

		// 	event.locals.user = dataUser.data;
		// 	event.locals.userMenu = userMenuResult.data;
		// 	event.locals.userLang = userLangResult.data;
		// 	event.locals.userGroup = userGroupResult.data;

		// 	isLoggedIn = true;

		// } else {

		// 	event.cookies.delete('session_id', { path: '/' });

		// 	if (!isPublic) {
		// 		throw redirect(303, '/login');
		// 	}

		// 	return resolve(event);
		// }
	}

	return resolve(event);
}