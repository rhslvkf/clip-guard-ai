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
    const response = await chrome.runtime.sendMessage({
      type: 'GET_SETTINGS',
    });

    if (response.success) {
      return response.data.enabled !== false; // Default to true
    }
    return true;
  } catch (error) {
    console.error('[Clip Guard AI] Error checking enabled status:', error);
    return true; // Default to enabled on error
  }
}

/**
 * Increment protected secrets counter
 */
export async function incrementProtectedCount(count: number = 1): Promise<void> {
  try {
    await chrome.runtime.sendMessage({
      type: 'INCREMENT_PROTECTED_COUNT',
      data: { count },
    });
  } catch (error) {
    console.error('[Clip Guard AI] Error incrementing protected count:', error);
  }
}
