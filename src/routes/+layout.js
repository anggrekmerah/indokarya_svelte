import {locale} from '$lib/stores/i18n'
import { waitLocale } from 'svelte-i18n';
import { browser } from '$app/environment';

export async function load( {data}) {

    const {users} = data;
    const lang = (users !== null) ? users : 'id'
    
    // if (browser) {
      await waitLocale();
      locale.set(lang)    
    // }


}