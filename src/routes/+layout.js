import {locale} from '$lib/stores/i18n'
import { waitLocale } from 'svelte-i18n';
import { browser } from '$app/environment';

export async function load( {data}) {
  
  await waitLocale()

	const L = typeof data.userLang?.lang === 'string'
		? data.userLang.lang
		: 'id'

	locale.set(L)

	return data
}