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
  categoryCounts: {
    cloud_keys: number;
    api_tokens: number;
    private_keys: number;
    passwords: number;
    database: number;
    network: number;
    pii: number;
  };
  registeredSites: string[];
  siteSettings: {
    [hostname: string]: {
      enabled: boolean;
      protectedCount: number;
    };
  };
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
    network: false, // Optional category, disabled by default
    pii: false, // Optional category, disabled by default
  },
  categoryCounts: {
    cloud_keys: 0,
    api_tokens: 0,
    private_keys: 0,
    passwords: 0,
    database: 0,
    network: 0,
    pii: 0,
  },
  registeredSites: [
    'chatgpt.com',
    'claude.ai',
    'gemini.google.com',
    'www.perplexity.ai',
    'grok.com',
  ],
  siteSettings: {
    'chatgpt.com': { enabled: true, protectedCount: 0 },
    'claude.ai': { enabled: true, protectedCount: 0 },
    'gemini.google.com': { enabled: true, protectedCount: 0 },
    'www.perplexity.ai': { enabled: true, protectedCount: 0 },
    'grok.com': { enabled: true, protectedCount: 0 },
  },
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

/**
 * Check if masking is enabled for specific site
 */
export async function isSiteEnabled(hostname: string): Promise<boolean> {
  const settings = await getSettings();

  // Check if site is registered
  if (!settings.registeredSites.includes(hostname)) {
    return false;
  }

  // Check global enabled status
  if (!settings.enabled) {
    return false;
  }

  // Check site-specific settings
  if (settings.siteSettings && settings.siteSettings[hostname]) {
    return settings.siteSettings[hostname].enabled;
  }

  // Default to enabled if no site-specific setting
  return true;
}

/**
 * Toggle site-specific enabled status
 */
export async function toggleSiteEnabled(hostname: string): Promise<boolean> {
  const settings = await getSettings();

  // Initialize siteSettings if not exists
  if (!settings.siteSettings) {
    settings.siteSettings = {};
  }

  // Initialize site setting if not exists
  if (!settings.siteSettings[hostname]) {
    settings.siteSettings[hostname] = { enabled: true, protectedCount: 0 };
  }

  // Toggle the setting
  settings.siteSettings[hostname].enabled = !settings.siteSettings[hostname].enabled;
  await saveSettings(settings);

  return settings.siteSettings[hostname].enabled;
}

/**
 * Update site-specific enabled status
 */
export async function updateSiteEnabled(hostname: string, enabled: boolean): Promise<void> {
  const settings = await getSettings();

  // Initialize siteSettings if not exists
  if (!settings.siteSettings) {
    settings.siteSettings = {};
  }

  // Update or create site setting
  const existingCount = settings.siteSettings[hostname]?.protectedCount || 0;
  settings.siteSettings[hostname] = { enabled, protectedCount: existingCount };
  await saveSettings(settings);
}

/**
 * Increment site-specific protected count
 */
export async function incrementSiteProtectedCount(hostname: string, count: number = 1): Promise<void> {
  const settings = await getSettings();

  // Initialize siteSettings if not exists
  if (!settings.siteSettings) {
    settings.siteSettings = {};
  }

  // Try to find matching site (with or without www prefix)
  let matchedHostname = hostname;

  // Check if hostname exists in siteSettings
  if (!settings.siteSettings[hostname]) {
    // Try with www prefix
    const withWww = hostname.startsWith('www.') ? hostname : `www.${hostname}`;
    const withoutWww = hostname.startsWith('www.') ? hostname.substring(4) : hostname;

    if (settings.siteSettings[withWww]) {
      matchedHostname = withWww;
    } else if (settings.siteSettings[withoutWww]) {
      matchedHostname = withoutWww;
    } else {
      // Initialize new site setting
      settings.siteSettings[hostname] = { enabled: true, protectedCount: 0 };
    }
  }

  // Initialize protectedCount if not exists (migration)
  if (typeof settings.siteSettings[matchedHostname].protectedCount !== 'number') {
    settings.siteSettings[matchedHostname].protectedCount = 0;
  }

  // Increment site-specific count
  settings.siteSettings[matchedHostname].protectedCount += count;
  await saveSettings(settings);
}

/**
 * Increment category-specific counters
 */
export async function incrementCategoryCounts(
  categoryCounts: Record<string, number>
): Promise<void> {
  const settings = await getSettings();

  // Initialize categoryCounts if not exists (for migration)
  if (!settings.categoryCounts) {
    settings.categoryCounts = {
      cloud_keys: 0,
      api_tokens: 0,
      private_keys: 0,
      passwords: 0,
      database: 0,
      network: 0,
      pii: 0,
    };
  }

  // Increment each category count
  for (const [category, count] of Object.entries(categoryCounts)) {
    if (settings.categoryCounts[category as keyof typeof settings.categoryCounts] !== undefined) {
      settings.categoryCounts[category as keyof typeof settings.categoryCounts] += count;
    }
  }

  await saveSettings(settings);
}
