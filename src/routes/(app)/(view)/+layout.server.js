/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
    // You can use fetch to call APIs or access database here
    
    return {
        userLang : locals.userLang.lang
    }
}