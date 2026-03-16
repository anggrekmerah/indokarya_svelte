import { fail } from '@sveltejs/kit';
import { forgotPassword } from '$lib/tools/authAPI.js'

export const actions = {
	forgotPassword: async ({ request, fetch }) => {

		const formData = await request.formData();
		const email = formData.get('email');

		const response = await forgotPassword({ email : email }, fetch); 
		console.log(response)
		if (!response || response.error) {
			return fail(400, { success: false, message: response.message || 'Email tidak terdaftar' });
		}

		return {
			success: true
		};
	}
};