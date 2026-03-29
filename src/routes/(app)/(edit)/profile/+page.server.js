import { fail } from '@sveltejs/kit';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { userChangeProfile } from '$lib/tools/userApi';

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

/** @type {import('./$types').Actions} */
export const actions = {
    updateProfile: async ({ request, locals, cookies }) => {
        const formData = await request.formData();
        
        // Mengambil data dari form [cite: 12, 13, 14, 15, 18, 19]
        const id = formData.get('id');
        const name = formData.get('name');
        const email = formData.get('email');
        const phone_number = formData.get('phone_number');
        const birth_date = formData.get('birth_date');
        const gender = formData.get('gender');
        const imageFile = formData.get('imageFile');
        const userID = locals.user?.id;

        // Validasi dasar
        if (!name || !email) {
            return fail(400, { error: true, message: 'Nama dan Email wajib diisi.' });
        }

        try {
            let fileName = '';

            // Logika Upload File ke /static/uploads
            if (imageFile && imageFile instanceof File && imageFile.size > 0) {
                // 1. Tentukan path folder tujuan
                const uploadDir = join(process.cwd(), 'static', 'uploads');

                // 2. Buat folder jika belum ada
                if (!existsSync(uploadDir)) {
                    mkdirSync(uploadDir, { recursive: true });
                }

                // 3. Buat nama file yang unik (mencegah duplikasi/overwrite)
                const extension = imageFile.name.split('.').pop();
                fileName = `user-${id}-${Date.now()}.${extension}`;
                const filePath = join(uploadDir, fileName);

                // 4. Ubah file ke Buffer dan simpan
                const buffer = Buffer.from(await imageFile.arrayBuffer());
                writeFileSync(filePath, buffer);
                
                console.log(`File berhasil disimpan di: ${filePath}`);
            }

            // URL yang akan disimpan di database atau dikembalikan ke UI
            const finalImageUrl = fileName ? `/uploads/${fileName}` : null;

            const payload = { 
                'ID': userID,
                'id_user' : id,  
                'name' : name, 
                'email': email, 
                'phone_number': phone_number, 
                'birth_date': birth_date, 
                'gender': gender, 
                'image_url': finalImageUrl 
            }
            console.log(payload)
            const changeProfile = await userChangeProfile(payload, fetch)
            console.log(changeProfile)
            if(changeProfile.error){
                return fail(401, { 
                    message: 'Failed change profile.' 
                });
            } else {
                return { 
                    success: true, 
                    message: 'Profil dan foto berhasil diperbarui!',
                    imageUrl: finalImageUrl 
                };
            }

            
        } catch (err) {
            console.error("Upload/Update Error:", err);
            return fail(500, { error: true, message: 'Gagal menyimpan data ke server.' });
        }
    }
};