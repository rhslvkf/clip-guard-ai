/**
 * Clip Guard AI - Content Script
 * Intercepts paste events and masks secrets on registered sites
 */

import { initClipboardInterceptor, isExtensionEnabled } from './clipboardInterceptor';

// Initialize content script
async function init() {
  console.log('[Clip Guard AI] Content script loaded on:', window.location.hostname);

  // Check if extension is enabled
  const enabled = await isExtensionEnabled();

  if (!enabled) {
    console.log('[Clip Guard AI] Extension is disabled');
    return;
  }

  // Initialize clipboard interceptor
  initClipboardInterceptor();

  console.log('[Clip Guard AI] Ready to protect secrets!');
}

// Run initialization
init().catch((error) => {
  console.error('[Clip Guard AI] Initialization failed:', error);
});
