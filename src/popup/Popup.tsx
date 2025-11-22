/**
 * Main popup component
 */

import { useEffect, useState } from 'react';
import { Toggle } from './components/Toggle';
import { Counter } from './components/Counter';
import { SiteStatus } from './components/SiteStatus';

interface Settings {
  enabled: boolean;
  protectedCount: number;
}

export function Popup() {
  const [settings, setSettings] = useState<Settings>({
    enabled: true,
    protectedCount: 0,
  });
  const [hostname, setHostname] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // Get settings
      const settingsResponse = await chrome.runtime.sendMessage({
        type: 'GET_SETTINGS',
      });

      if (settingsResponse.success) {
        setSettings({
          enabled: settingsResponse.data.enabled,
          protectedCount: settingsResponse.data.protectedCount,
        });
      }

      // Get current tab hostname
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.url) {
        const url = new URL(tab.url);
        setHostname(url.hostname);

        // Check if site is registered
        const registeredResponse = await chrome.runtime.sendMessage({
          type: 'IS_SITE_REGISTERED',
          data: { hostname: url.hostname },
        });

        if (registeredResponse.success) {
          setIsRegistered(registeredResponse.data);
        }
      }
    } catch (error) {
      console.error('[Clip Guard AI] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle() {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'TOGGLE_ENABLED',
      });

      if (response.success) {
        setSettings((prev) => ({ ...prev, enabled: response.data }));
      }
    } catch (error) {
      console.error('[Clip Guard AI] Error toggling enabled:', error);
    }
  }

  function openSettings() {
    chrome.runtime.openOptionsPage();
  }

  if (loading) {
    return (
      <div className="w-80 p-4 bg-bg-primary">
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 p-4 bg-bg-primary">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center">
            <svg
              className="w-5 h-5 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-text-primary">Clip Guard AI</h1>
        </div>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="mb-4 p-3 bg-bg-secondary rounded-lg border border-border-default">
        <Toggle enabled={settings.enabled} onChange={handleToggle} label="Protection" />
      </div>

      {/* Current Site Status */}
      <div className="mb-4">
        <SiteStatus hostname={hostname} isRegistered={isRegistered} />
      </div>

      {/* Protected Counter */}
      <div className="mb-4">
        <Counter count={settings.protectedCount} />
      </div>

      {/* Settings Link */}
      <button
        onClick={openSettings}
        className="w-full py-2 px-3 bg-bg-tertiary hover:bg-border-subtle text-text-primary text-sm rounded-lg border border-border-default transition-colors"
      >
        Open Settings
      </button>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-border-subtle">
        <p className="text-xs text-text-muted text-center">
          100% Local Processing • Zero Cloud
        </p>
      </div>
    </div>
  );
}
