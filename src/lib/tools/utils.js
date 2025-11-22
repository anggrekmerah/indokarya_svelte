// src/lib/utils.js

/**
 * Debounce utility to prevent rapid function firing
 */
export function debounce(fn, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
}

// Anda juga bisa memindahkan getFilterParams di sini jika lebih suka
// export function getFilterParams(searchParams) { ... }