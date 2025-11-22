/**
 * Clipboard interceptor for monitoring paste events
 * Handles edge cases and different paste scenarios
 */

import { handlePaste } from './pasteHandler';

/**
 * Initialize clipboard interception
 */
export function initClipboardInterceptor(): void {
  // Listen for paste events on the document
  document.addEventListener('paste', handlePaste, true);

  console.log('[Clip Guard AI] Clipboard interceptor initialized');
}

/**
 * Cleanup clipboard interceptor
 */
export function cleanupClipboardInterceptor(): void {
  document.removeEventListener('paste', handlePaste, true);

  console.log('[Clip Guard AI] Clipboard interceptor cleaned up');
}

/**
 * Check if extension is enabled for current site
 */
export async function isExtensionEnabled(): Promise<boolean> {
  try {
    const result = await chrome.storage.local.get('enabled');
    return result.enabled !== false; // Default to true
  } catch (error) {
    console.error('[Clip Guard AI] Error checking enabled status:', error);
    return true; // Default to enabled on error
  }
}
