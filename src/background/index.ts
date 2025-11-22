// Background service worker placeholder
console.log('Clip Guard AI - Background worker initialized');

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});
