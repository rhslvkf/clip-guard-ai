/**
 * Clip Guard AI - Content Script
 * Intercepts paste events and masks secrets on registered sites
 */

import { initClipboardInterceptor, isExtensionEnabled, cleanupClipboardInterceptor } from './clipboardInterceptor';
import { cleanupToasts } from './toast';
import { initCopyHandler } from './copyHandler';

let isInitialized = false;

// Initialize content script
async function init() {
  console.log('[Clip Guard AI] Content script loaded on:', window.location.hostname);

  // Check if extension is enabled
  const enabled = await isExtensionEnabled();

  if (!enabled) {
    console.log('[Clip Guard AI] Extension is disabled');
    if (isInitialized) {
      cleanupClipboardInterceptor();
      cleanupToasts();
      isInitialized = false;
    }
    return;
  }

  // Check if site is enabled
  const hostname = window.location.hostname;
  const response = await chrome.runtime.sendMessage({
    type: 'IS_SITE_ENABLED',
    data: { hostname },
  });

  if (!response.success || !response.data.enabled) {
    console.log('[Clip Guard AI] Site is disabled');
    if (isInitialized) {
      cleanupClipboardInterceptor();
      cleanupToasts();
      isInitialized = false;
    }
    return;
  }

  // Initialize clipboard interceptor if not already initialized
  if (!isInitialized) {
    initClipboardInterceptor();
    initCopyHandler();
    isInitialized = true;
    console.log('[Clip Guard AI] Ready to protect secrets!');
  }
}

// Note: Session storage is automatically cleared when tab/session closes
// No need to manually clear on beforeunload (causes "Access to storage is not allowed" error)

// Listen for settings changes
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'SETTINGS_CHANGED') {
    // Reinitialize if:
    // 1. Global enabled/disabled (message.data.global)
    // 2. Site-specific enabled/disabled (message.data.hostname)
    // Category changes don't need reinitialization since handlePaste
    // fetches fresh settings on every paste
    if (message.data && (message.data.global || message.data.hostname)) {
      console.log('[Clip Guard AI] Global or site settings changed, reloading...');
      init().catch((error) => {
        console.error('[Clip Guard AI] Reinitialization failed:', error);
      });
    } else if (message.data && message.data.category) {
      // Category changed - no action needed
      // handlePaste will get fresh settings on next paste
      console.log('[Clip Guard AI] Category settings changed, ready for next paste');
    }
  }
});

// Run initialization
init().catch((error) => {
  console.error('[Clip Guard AI] Initialization failed:', error);
});
