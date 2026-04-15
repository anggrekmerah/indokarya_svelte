import { fail } from '@sveltejs/kit';
import { forgotPassword } from '$lib/tools/authAPI.js'
import { t } from 'svelte-i18n';
import { get } from 'svelte/store';

export const actions = {
	forgotPassword: async ({ request, fetch }) => {

		const formData = await request.formData();
		const email = formData.get('email');

		const response = await forgotPassword({ email : email }, fetch); 
		
		if (!response || response.error) {
			return fail(400, { success: false, message: get(t)(response.message_key) || get(t)('Email tidak terdaftar') });
		}

		return {
			success: true
		};
	}
};