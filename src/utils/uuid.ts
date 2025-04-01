/**
 * Generate a UUID v4 string.
 * This is a polyfill for crypto.randomUUID() which may not be available in all environments.
 */
export function generateUUID(): string {
  // If native crypto.randomUUID is available, use it
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  
  // Otherwise fallback to a manual implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
} 