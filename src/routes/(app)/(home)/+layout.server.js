/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
    // You can use fetch to call APIs or access database here
    
    return {
        userLang : locals.userLang.lang
        ,users : locals.user
        ,group : locals.userGroup[0].group_name
    }
}