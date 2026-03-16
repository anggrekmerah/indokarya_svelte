/** @type {import('./$types').PageServerLoad} */
export async function load({ locals , parent}) {

    const parentData = await parent()
    // You can use fetch to call APIs or access database here
    console.log(parentData.userLang)
    return {
        user : parentData.user,
        userGroup : parentData.group
    }
}