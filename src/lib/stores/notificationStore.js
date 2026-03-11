import { writable } from 'svelte/store';

export const notification = writable(null);

export function showToast(title, body, type = 'info', duration = 5000) {
    // type bisa: 'success', 'error', 'warning', atau 'info'
    notification.set({ title, body, type });
    
    setTimeout(() => {
        notification.set(null);
    }, duration);
}