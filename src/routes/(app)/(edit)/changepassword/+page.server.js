import { fail, redirect } from '@sveltejs/kit';
import { loginAPI } from '$lib/tools/tokenApi';
import { userChangePasswordAPI } from '$lib/tools/userApi';
/**
 * @type {import('@sveltejs/kit').PageServerLoad}
 */
export async function load({ locals }) {
    // Accessing the authenticated user's email from the locals object,
    // which is typically populated by a server hook (src/hooks.server.js).
    // We assume 'locals' has a 'user' object with an 'email' property.
    const userEmail = locals.user?.email || null;
    
    // Return the email along with any other data needed by the page.
    return {
        userEmail: userEmail
    };
}


/**
 * @type {import('@sveltejs/kit').Actions}
 */
export const actions = {
    // This action handles the POST request from the form in ChangePassword.svelte,
    // which uses action="?/changePassword".
    changePassword: async ({ request, locals, cookies }) => {
        // 1. Extract form data
        const data = await request.formData();
        const oldPassword = data.get('oldPassword');
        const newPassword = data.get('newPassword');
        const confirmPassword = data.get('confirmPassword');
        
        // --- Server-side Validation ---

        if (newPassword !== confirmPassword) {
            // Use fail() to return an error object that SvelteKit's enhance utility handles.
            return fail(400, { 
                error: 'New password and confirmation do not match.',
                fields: { oldPassword, newPassword, confirmPassword } 
            });
        }

        if (newPassword.length < 8) {
            return fail(400, {
                error: 'New password must be at least 8 characters long.',
                fields: { oldPassword, newPassword, confirmPassword } 
            });
        }


        // --- Authentication and Password Update Logic (SIMULATED) ---
        
        try {

            const userEmail = locals.user?.email;
            const userID = locals.user?.id;

            const originalString = userEmail + ':' + oldPassword;
        
            let encodedString = btoa(originalString);

            const dataLogin = await loginAPI({ auth : encodedString }, fetch);
            // 2. Authenticate the user's old password (Critical security step)
            // In a real application, you would use an auth library (like Firebase/Supabase/AuthJS)
            // to verify the current user's old password before updating.
            // Example: const isOldPasswordValid = await auth.verifyPassword(locals.user.id, oldPassword);

            // Simulating a failed authentication
            if (dataLogin) {
    
                if(dataLogin.error) {
                    return fail(401, { 
                        error: 'Incorrect current password.',
                        fields: { oldPassword, newPassword, confirmPassword } 
                    });
                }
                console.log({ID:userID,password:newPassword})    
                const changepass = await userChangePasswordAPI({ID:userID,password:newPassword}, fetch)
                console.log(changepass)
                if(changepass.error){
                    return fail(401, { 
                        error: 'Failed change password.',
                        fields: { oldPassword, newPassword, confirmPassword } 
                    });
                } else {
                    console.log(`[ACTION SUCCESS]: Password successfully updated for user!`);
                    // Clear the session cookie to log the user out.
                    cookies.delete('session_id', { path: '/' });

                    // Redirect to the login page with a success message in the URL
                    throw redirect(303, '/login?loggedOut=true');
                }

            } else {
                // If credentials are not valid, return a failure with a message.
                return fail(401, { 
                        error: 'Incorrect current password.',
                        fields: { oldPassword, newPassword, confirmPassword } 
                    });
            }


        } catch (error) {
            // Handle specific errors from the authentication/database service
            console.error("Password update error:", error);
            
            // Return a generic error to the client
            return fail(500, {
                error: 'Failed to update password due to a server error.',
                fields: { oldPassword, newPassword, confirmPassword } 
            });
        }
        
        // 4. Success Response
        // On success, simply return an object with success: true.
        // The `ChangePassword.svelte` component will catch this result.type === 'success'.
        return { success: true };
    }
};