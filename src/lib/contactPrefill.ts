// Hand-over of a prefilled contact request (product "Order", calculator) to
// the contact form without putting it into the URL.
const KEY = 'contactPrefill';

export type ContactPrefill = { service?: string; message?: string };

export function saveContactPrefill(data: ContactPrefill) {
  try { sessionStorage.setItem(KEY, JSON.stringify(data)); } catch { /* storage blocked: form stays empty */ }
}

/** Reads and clears the saved request; falls back to legacy ?service=&message= links. */
export function takeContactPrefill(): ContactPrefill {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) {
      sessionStorage.removeItem(KEY);
      return JSON.parse(raw) as ContactPrefill;
    }
  } catch { /* ignore */ }
  const params = new URLSearchParams(window.location.search);
  return { service: params.get('service') ?? '', message: params.get('message') ?? '' };
}
