
import { monthlyAttendance } from '$lib/tools/attendenceAPI'

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, fetch, locals }) {
    // You can use fetch to call APIs or access database here
    
    let returnData = {}

    const getMonthlyAttendance = await monthlyAttendance({user_id : locals.user.id}, fetch)
    returnData.monthlyAttendance = getMonthlyAttendance

    return returnData;
}
