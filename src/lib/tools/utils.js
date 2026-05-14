// src/lib/utils.js
import { get } from 'svelte/store';

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

export function withSubmitGuard(existingEnhancer, options = {}) {
    let internalSubmitting = false;

    return (args) => {
        return async (event) => {
            const { formElement, cancel } = event;

            if (internalSubmitting) {
                cancel();
                return;
            }

            internalSubmitting = true;
            options.setSubmitting?.(true);

            const buttons = formElement.querySelectorAll('button[type="submit"]');
            buttons.forEach(btn => btn.disabled = true);

            try {
                // 🔥 PENTING: panggil existingEnhancer DI SINI
                const maybeHandler = await existingEnhancer(event);

                // ⚠️ kalau existing tidak return function
                if (typeof maybeHandler !== 'function') {
                    buttons.forEach(btn => btn.disabled = false);
                    internalSubmitting = false;
                    options.setSubmitting?.(false);
                    return;
                }

                return async (resultEvent) => {
                    try {
                        await maybeHandler(resultEvent);
                    } finally {
                        buttons.forEach(btn => btn.disabled = false);
                        internalSubmitting = false;
                        options.setSubmitting?.(false);
                    }
                };

            } catch (err) {
                console.error(err);

                buttons.forEach(btn => btn.disabled = false);
                internalSubmitting = false;
                options.setSubmitting?.(false);

                cancel();
            }
        };
    };
}

export function parseMessageKey(t, messageKey) {
  const translate = get(t);

  if (!messageKey) return '';

  // kalau string
  if (typeof messageKey === 'string') {
    return translate(messageKey);
  }

  // kalau array
  if (Array.isArray(messageKey)) {
    return messageKey
      .map((item) => {
        if (!item || !item.key) return '';

        // kalau ada params
        if (item.params) {
          return translate(item.key, item.params);
        }

        return translate(item.key);
      })
      .filter(Boolean)
      .join(', '); // bisa ganti '\n' kalau mau multiline
  }

  // fallback
  return String(messageKey);
}