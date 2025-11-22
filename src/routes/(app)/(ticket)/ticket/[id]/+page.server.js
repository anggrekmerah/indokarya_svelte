import { ticketDetailAPI, ticketCheckInAPI, ticketCheckOutAPI, ticketRequestUnlockAPI } from '$lib/tools/ticketApi';
import { writeFile } from 'fs/promises';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fail, redirect } from '@sveltejs/kit';
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_ID } from '$env/static/private';
import { mkdirSync } from 'fs';


/** @type {import('./$types').PageServerLoad} */
export async function load({ params, fetch, locals }) {
  // You can use fetch to call APIs or access database here
    
    const detailTicket = await ticketDetailAPI({ID : locals.user.id, id_ticket: params.id}, fetch)
    
    if(detailTicket.error){
        // If the process is successful, redirect the user
            redirect(303, '/home');
    }     
    console.log(detailTicket.data[0])
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

            return {
                status: 200,
                success: true
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
        const directoryPath = './static/report/' + id_ticket + '/';

        if (!photo) {
            return fail(400, { message: 'No photo uploaded.' });
        }

        mkdirSync(directoryPath, { recursive: true });
        const extension = extname(photo.name);
        const uniqueFilename = `${id_ticket}_${uuidv4()}${extension}`;
        const filePath = `${directoryPath}${uniqueFilename}`;

        try {
            await writeFile(filePath, Buffer.from(await photo.arrayBuffer()));
            const updateTicket = await ticketCheckInAPI({ID:idUser, id_ticket: id_ticket, photo:filePath }, fetch)
            if(updateTicket.error)
                return fail(500, { message: 'Server error during update ticket.' });

            return {
                status: 200,
                success: true
            };
        } catch (error) {
            console.error('Failed to save file:', error);
            return fail(500, { message: 'Server error during upload.' });
        }

    },

    checkout: async ({request, fetch, locals, params}) => {
        const data = await request.formData();
        console.log(data)
        const reportDescription = data.get('description')
        const ticketId = data.get('id_ticket')
        const machineReports = data.get('machineReports')
        const generalNotes = data.get('generalNotes')
        const signature = data.get('signature')
        const files = data.getAll('files')
        const idUser = locals.user.id
        let errors ={}
        const directoryPath = './static/report/' + ticketId + '/';
        
        if (!machineReports) {
            return fail(400, { message: 'Report Machine Reports must not empty.' });
        }

        if (!generalNotes) {
            return fail(400, { message: 'Report General Notes must not empty.' });
        }

        if (!reportDescription) {
            return fail(400, { message: 'Report Description must not empty.' });
        }

        if (!signature) {
            return fail(400, { message: 'Signature must set.' });
        }

 
        try {
            
            mkdirSync(directoryPath, { recursive: true });

            const machines = JSON.parse(machineReports)
            let signExt = extname(signature.name);
            let uniqueFilename = `${ticketId}_signature${signExt}`;
            let signFilePath = `${directoryPath}${uniqueFilename}`;
            let pathVideo = []
            let pathImage = []

            await writeFile(signFilePath, Buffer.from(await signature.arrayBuffer()));
            
            for (let i = 0; i < files.length; i++) {
                let e = files[i];
                let machineID = e.name.split('_')[1]
                let fileExt = extname(e.name);

                let uniqFilename = `${ticketId}_${uuidv4()}${fileExt}`;
                let FilePath = `${directoryPath}${uniqFilename}`;
                
                if(e.type == 'video/webm')
                    pathVideo.push({machine_id:machineID, file: FilePath})
                else
                    pathImage.push({machine_id:machineID, file: FilePath})

                await writeFile(FilePath, Buffer.from( await e.arrayBuffer()));
            }

            const bodyUpdate = {
                    ID:idUser,
                    id_ticket:ticketId, 
                    signature:signFilePath,
                    comment:reportDescription,
                    notes:generalNotes,
                    videos:pathVideo,
                    photos:pathImage,
                    machineReports: machines
                }
            
            const updateTicket = await ticketCheckOutAPI(bodyUpdate, fetch);
                
            // If there is an error, fail and return immediately
            if (updateTicket.error) {
                return fail(500, { message: 'Server error during update ticket.' });
            }

            return {
                status: 200,
                success: true
            };
            
        } catch (error) {
            
            console.error('Failed to save file:', error);
            return fail(500, { message: 'Server error during upload.' });
        }
 
    }
}