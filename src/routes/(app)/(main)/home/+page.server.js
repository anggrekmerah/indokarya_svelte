import { getTicketAssign, ticketCheckInAPI } from '$lib/tools/ticketApi';
// import { writeFile } from 'fs/promises';
// import { extname } from 'path';
// import { v4 as uuidv4 } from 'uuid';
// import { fail } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, fetch, locals }) {
  // You can use fetch to call APIs or access database here
    const idUser = locals.user.id
    const listTicket = await getTicketAssign({"ID" : idUser}, fetch)
    return {
        listTicket: listTicket.data
    };
}


// /** @type {import('./$types').Actions} */
// export const actions = {

//     checkin: async ({ request, cookies, fetch, locals }) => {
//         const data = await request.formData();
//         console.log(data)
//         const photo = data.get('photo');
//         const id_ticket = data.get('id_ticket');

//         if (!photo) {
//             return fail(400, { message: 'No photo uploaded.' });
//         }

//         const extension = extname(photo.name);
//         const uniqueFilename = `${id_ticket}_${uuidv4()}${extension}`;
//         const filePath = `./static/uploads/${uniqueFilename}`;

//         try {
//             await writeFile(filePath, Buffer.from(await photo.arrayBuffer()));
//             const updateTicket = await ticketCheckInAPI({ID:id_ticket, photo:filePath }, fetch)
//             if(updateTicket.error)
//                 return fail(500, { message: 'Server error during update ticket.' });

//             const updatedData = await load({ locals, fetch });
//             return {
//                 status: 200,
//                 ...updatedData
//             };
//         } catch (error) {
//             console.error('Failed to save file:', error);
//             return fail(500, { message: 'Server error during upload.' });
//         }

//     }
// }