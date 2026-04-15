import { fail } from '@sveltejs/kit'
import { get } from 'svelte/store';
import { t } from 'svelte-i18n';
import { validateResetPassword, resetPassword } from '$lib/tools/authAPI.js'

export async function load({ url, fetch }) {

	const token = url.searchParams.get("token");

	if (!token) {
		return {
			error: get(t)("Token tidak ditemukan")
		};
	}

	const res = await validateResetPassword({'token': token}, fetch);
	if (res.error) {
		return {
			error: get(t)("Token tidak valid atau expired")
		};
	}

	return {
		token
	};
}


/** @type {import('./$types').Actions} */
export const actions = {

	resetPassword: async ({ request, fetch }) => {

		const form = await request.formData();

		const token = form.get("token");
		const password = form.get("password");
		const confirm = form.get("confirm");

		if (!password || !confirm) {
			return fail(400, { success: false, message: get(t)('Semua field wajib diisi') });
		}

		if (password !== confirm) {
			return fail(400, { success: false, message: get(t)('Password tidak sama') });
		}

		const res = await resetPassword( {'token' : token, 'password': password} ,fetch)

		if (res.error) {
			return fail(400, { success: false, message: get(t)(res.message_key) });
		}

		return {
			success: get(t)("Password berhasil diubah")
		};
	}
};