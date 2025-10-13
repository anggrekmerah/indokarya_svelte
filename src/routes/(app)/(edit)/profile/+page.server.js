/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
    // You can use fetch to call APIs or access database here
    console.log(locals.userLang)
    return {
        user : locals.user,
        userGroup : locals.userGroup
    }
}