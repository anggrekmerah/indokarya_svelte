
/** @type {import('./$types').LayoutServerLoad} */
export async function load({locals}) {

	return {
		userMenu: locals.userMenu,
		userID: locals.user.id
	};
}

