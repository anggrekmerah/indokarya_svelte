<script>
    import { slide, fade } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { enhance } from '$app/forms';
    import { _ } from 'svelte-i18n';

    let { data, closeMenu } = $props();

    // Data dipisahkan agar kode HTML tetap bersih  4]
    const menuItems = [
        { 
            title: 'Profile', 
            url: 'profile', 
            desc: 'Detail akun dan informasi personal',
            svg: 'M320 312C386.3 312 440 258.3 440 192C440 125.7 386.3 72 320 72C253.7 72 200 125.7 200 192C200 258.3 253.7 312 320 312zM290.3 368C191.8 368 112 447.8 112 546.3C112 562.7 125.3 576 141.7 576L498.3 576C514.7 576 528 562.7 528 546.3C528 447.8 448.2 368 349.7 368L290.3 368z' 
        },
        { 
            title: 'Change Password', 
            url: 'changepassword', 
            desc: 'Perbarui keamanan kata sandi Anda',
            svg: 'M400 416C497.2 416 576 337.2 576 240C576 142.8 497.2 64 400 64C302.8 64 224 142.8 224 240C224 258.7 226.9 276.8 232.3 293.7L71 455C66.5 459.5 64 465.6 64 472L64 552C64 565.3 74.7 576 88 576L168 576C181.3 576 192 565.3 192 552L192 512L232 512C245.3 512 256 501.3 256 488L256 448L296 448C302.4 448 308.5 445.5 313 441L346.3 407.7C363.2 413.1 381.3 416 400 416z' 
        }
    ];

    const menuButtons = [
        // { name: 'Rembes', icon: '💸', url : '' },
        { name: 'Cuti', icon: '📅', url : '/cuti' },
        // { name: 'Absen', icon: '📝', url : '' },
        { name: 'Daftar Absen', icon: '📋', url : '/absen-list' }
    ];
</script>

<main class="min-h-screen bg-slate-50 p-4 md:p-8 pt-18 md:pt-18 font-sans">
<div class="flex-1 overflow-y-auto py-4 px-4 space-y-3">
        
        <div class="space-y-1">
             <span class="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">HRIS</span>
            {#each menuButtons as item}
                <a 
                href="{item.url}" 
                class="w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 transition-all flex items-center gap-4 active:scale-[0.98]"
                >
                <div class="bg-slate-50 p-3 rounded-2xl text-2xl flex items-center justify-center min-w-[54px]">
                    {item.icon}
                </div>
                
                <div class="flex-1">
                    <span class="text-sm font-black text-slate-700 uppercase tracking-wide block">
                    {item.name}
                    </span>
                    {#if item.description}
                    <p class="text-[10px] text-slate-400 font-medium">{item.description}</p>
                    {/if}
                </div>

                <div class="text-indigo-500 opacity-20">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                </div>
                </a>
            {/each}
        </div>

        <div class="space-y-1 pt-4">
            <span class="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Keamanan & Akun</span>
            {#each menuItems as item}
                <a 
                    href="/{item.url}" 
                    onclick={closeMenu}
                    class="flex items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
                > 
                    <div class="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <svg viewBox="0 0 576 512" class="h-5 w-5 fill-current">
                            <path d={item.svg}/>
                        </svg> 
                    </div>
                    <div class="ml-4 flex-1">
                        <p class="text-sm font-semibold text-slate-800">{$_(item.title)}</p> 
                        <p class="text-xs text-slate-500">{item.desc}</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-300 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </a>
            {/each}
        </div>

        <div class="space-y-1 pt-4">
            <span class="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Aplikasi</span>
            <button 
                onclick={closeMenu}
                class="w-full flex items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-orange-200 transition-all group text-left"
            >
                <div class="h-10 w-10 flex items-center justify-center rounded-xl bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <svg viewBox="0 0 640 512" class="h-5 w-5 fill-current">
                        <path d="M320 448c-121.5 0-213.7-93-213.7-213.7 0-112.5 83.3-195.8 195.8-195.8s195.8 83.3 195.8 195.8c0 120.7-92.2 213.7-213.7 213.7z"/>
                    </svg>
                </div>
                <div class="ml-4 flex-1">
                    <p class="text-sm font-semibold text-slate-800">
                        {data.userLang === 'en' ? 'Bahasa Indonesia' : 'English Language'}
                    </p> 
                    <p class="text-xs text-slate-500">Klik untuk mengganti bahasa aplikasi</p>
                </div>
                <span class="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase">
                    {data.userLang === 'en' ? 'EN' : 'ID'} 
                </span>
            </button>
        </div>

        <div class="pt-5 pb-24">
            <form action="/login?/logout" method="POST" use:enhance> 
                <button type="submit" class="w-full flex items-center justify-center p-4 bg-red-50 hover:bg-red-600 rounded-2xl text-red-600 hover:text-white transition-all duration-300 font-bold border border-red-100"> 
                    <svg viewBox="0 0 576 512" class="h-5 w-5 fill-current mr-2">
                        <path d="M569 337C578.4 327.6 578.4 312.4 569 303.1L425 159C418.1 152.1 407.8 150.1 398.8 153.8C389.8 157.5 384 166.3 384 176L384 256L272 256C245.5 256 224 277.5 224 304L224 336C224 362.5 245.5 384 272 384L384 384L384 464C384 473.7 389.8 482.5 398.8 486.2C407.8 489.9 418.1 487.9 425 481L569 337zM224 160C241.7 160 256 145.7 256 128C256 110.3 241.7 96 224 96L160 96C107 96 64 139 64 192L64 448C64 501 107 544 160 544L224 544C241.7 544 256 529.7 256 512C256 494.3 241.7 480 224 480L160 480C142.3 480 128 465.7 128 448L128 192C128 174.3 142.3 160 160 160L224 160z"/>
                    </svg> 
                    {$_('Log Out')} 
                </button>
            </form>
        </div>
    </div>
</main>
