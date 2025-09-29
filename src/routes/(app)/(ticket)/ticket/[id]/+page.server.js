import { ticketDetailAPI, ticketCheckInAPI, ticketCheckOutAPI, ticketRequestUnlockAPI } from '$lib/tools/ticketApi';
import { writeFile } from 'fs/promises';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fail, redirect } from '@sveltejs/kit';
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_ID } from '$env/static/private';


/** @type {import('./$types').PageServerLoad} */
export async function load({ params, fetch, locals }) {
  // You can use fetch to call APIs or access database here
    
    const detailTicket = await ticketDetailAPI({ID : locals.user.id, id_ticket: params.id}, fetch)
    
    if(detailTicket.error){
        // If the process is successful, redirect the user
            redirect(303, '/home');
    }     

    return {
        detailTicket: detailTicket.data[0],
        mapsKey : GOOGLE_MAPS_API_KEY,
        mapsId : GOOGLE_MAPS_ID
    };
}



/** @type {import('./$types').Actions} */
export const actions = {

    unlock_report: async ({request, fetch, locals, params}) => {
        const data = await request.formData();
        const id_ticket = data.get('id_ticket');
        const reason_unlocked = data.get('reason_unlocked');
        if (!reason_unlocked) {
            return fail(400, { message: 'Please fill the reason.' });
        }
        try {
            const unlockReport = await ticketRequestUnlockAPI({ID:locals.user.id, id_ticket: id_ticket, unlock_reason: reason_unlocked }, fetch)
            
            if(unlockReport.error)
                return fail(500, { message: 'Server error during unlock ticket.' });

            const updatedData = await load({ params, fetch, locals });
            return {
                status: 200,
                ...updatedData
            };
        } catch (error) {
            
            return fail(500, { message: 'Server error during upload.' });
        }
        
    },
    checkin: async ({ request, cookies, fetch, locals, params }) => {
        const data = await request.formData();

        const photo = data.get('photo');
        const id_ticket = data.get('id_ticket');
        const idUser = locals.user.id

        if (!photo) {
            return fail(400, { message: 'No photo uploaded.' });
        }

        const extension = extname(photo.name);
        const uniqueFilename = `${id_ticket}_${uuidv4()}${extension}`;
        const filePath = `./static/uploads/${uniqueFilename}`;

        try {
            await writeFile(filePath, Buffer.from(await photo.arrayBuffer()));
            const updateTicket = await ticketCheckInAPI({ID:idUser, id_ticket: id_ticket, photo:filePath }, fetch)
            if(updateTicket.error)
                return fail(500, { message: 'Server error during update ticket.' });

            const updatedData = await load({ params, fetch, locals });
            return {
                status: 200,
                ...updatedData
            };
        } catch (error) {
            console.error('Failed to save file:', error);
            return fail(500, { message: 'Server error during upload.' });
        }

    },

    checkout: async ({request, fetch, locals, params}) => {
        const data = await request.formData();
        
        const reportDescription = data.get('reportDescription')
        const ticketId = data.get('ticketId')
        const spareParts = data.get('spareParts')
        const signature = data.get('signature')
        const files = data.getAll('files')
        const idUser = locals.user.id
        let errors ={}
        
        if (!reportDescription) {
            return fail(400, { message: 'Report Description must not empty.' });
        }

        if (!signature) {
            return fail(400, { message: 'Signature must set.' });
        }

        const signExt = extname(signature.name);
        const uniqueFilename = `${ticketId}_${uuidv4()}${signExt}`;
        const signFilePath = `./static/report/${uniqueFilename}`;
        let pathVideo = []
        let pathImage = []
        try {
            await writeFile(signFilePath, Buffer.from(await signature.arrayBuffer()));
            
            for (let i = 0; i < files.length; i++) {
                let e = files[i];
                let fileExt = extname(e.name);
                
                let uniqFilename = `${ticketId}_${uuidv4()}${fileExt}`;
                let FilePath = `./static/report/${uniqFilename}`;
                
                if(e.type == 'video/webm')
                    pathVideo.push(FilePath)
                else
                    pathImage.push(FilePath)

                await writeFile(FilePath, Buffer.from(await e.arrayBuffer()));
            }

            const bodyUpdate = {
                    ID:idUser,
                    id_ticket:ticketId, 
                    signature:signFilePath,
                    comment:reportDescription,
                    videos:pathVideo,
                    photos:pathImage,
                    spareparts:(spareParts == '') ? [] : spareParts.split(',') 
                }
            
            const updateTicket = await ticketCheckOutAPI(bodyUpdate, fetch);
                
            // If there is an error, fail and return immediately
            if (updateTicket.error) {
            return fail(500, { message: 'Server error during update ticket.' });
            }

        } catch (error) {
            
            console.error('Failed to save file:', error);
            return fail(500, { message: 'Server error during upload.' });
        }
 
    }
}