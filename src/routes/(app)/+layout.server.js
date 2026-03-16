
/** @type {import('./$types').LayoutServerLoad} */
export async function load({locals, fetch, parent}) {

	const parentData = await parent()

	return {
		userMenu: parentData.menu,
		userID: parentData.user.id
	};
}

