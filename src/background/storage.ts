/**
 * Chrome Storage API wrapper for settings persistence
 */

export interface AppSettings {
  enabled: boolean;
  categories: {
    cloud_keys: boolean;
    api_tokens: boolean;
    private_keys: boolean;
    passwords: boolean;
    database: boolean;
    network: boolean;
    pii: boolean;
  };
  registeredSites: string[];
  protectedCount: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  enabled: true,
  categories: {
    cloud_keys: true,
    api_tokens: true,
    private_keys: true,
    passwords: true,
    database: true,
    network: true,
    pii: false, // Optional category, disabled by default
  },
  registeredSites: [
    'chatgpt.com',
    'claude.ai',
    'gemini.google.com',
    'www.perplexity.ai',
    'grok.com',
  ],
  protectedCount: 0,
};

/**
 * Get all settings from Chrome storage
 */
export async function getSettings(): Promise<AppSettings> {
  return new Promise((resolve) => {
    chrome.storage.sync.get('settings', (result) => {
      if (result.settings) {
        resolve(result.settings as AppSettings);
      } else {
        resolve(DEFAULT_SETTINGS);
      }
    });
  });
}

/**
 * Save settings to Chrome storage
 */
export async function saveSettings(settings: AppSettings): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ settings }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Update specific setting field
 */
export async function updateSetting<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K]
): Promise<void> {
  const settings = await getSettings();
  settings[key] = value;
  await saveSettings(settings);
}

/**
 * Initialize default settings on first install
 */
export async function initializeSettings(): Promise<void> {
  const settings = await getSettings();

  // Only initialize if no settings exist
  if (!settings.registeredSites || settings.registeredSites.length === 0) {
    await saveSettings(DEFAULT_SETTINGS);
    console.log('[Clip Guard AI] Default settings initialized');
  }
}

/**
 * Reset settings to defaults
 */
export async function resetSettings(): Promise<void> {
  await saveSettings(DEFAULT_SETTINGS);
  console.log('[Clip Guard AI] Settings reset to defaults');
}

/**
 * Get enabled status
 */
export async function isEnabled(): Promise<boolean> {
  const settings = await getSettings();
  return settings.enabled;
}

/**
 * Toggle enabled status
 */
export async function toggleEnabled(): Promise<boolean> {
  const settings = await getSettings();
  settings.enabled = !settings.enabled;
  await saveSettings(settings);
  return settings.enabled;
}

/**
 * Increment protected secrets counter
 */
export async function incrementProtectedCount(count: number = 1): Promise<number> {
  const settings = await getSettings();
  settings.protectedCount += count;
  await saveSettings(settings);
  return settings.protectedCount;
}

/**
 * Get protected secrets counter
 */
export async function getProtectedCount(): Promise<number> {
  const settings = await getSettings();
  return settings.protectedCount;
}

/**
 * Reset protected secrets counter
 */
export async function resetProtectedCount(): Promise<void> {
  await updateSetting('protectedCount', 0);
}
