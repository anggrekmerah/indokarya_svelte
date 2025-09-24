import {locale} from '$lib/stores/i18n'
import { waitLocale } from 'svelte-i18n';
import { browser } from '$app/environment';

export async function load( {data}) {
  
  //   const userlang = locals.userlang.lang;
  
    await waitLocale();
    // if (browser) {
    const L = data.userLang ?? 'id'  
    await locale.set(L)    
    // }


}