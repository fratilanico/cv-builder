"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  ProviderName,
  ProviderSettings as Settings,
  ProviderStatus,
} from "@/types/provider";
import {
  defaultProviderSettings,
  loadProviderSettings,
  saveProviderSettings,
} from "@/types/provider";

const PROVIDER_OPTIONS: { value: ProviderName; label: string; description: string }[] = [
  {
    value: "claude-cli",
    label: "Claude CLI",
    description: "Uses local claude binary. Requires Claude Code or Claude CLI installed.",
  },
  {
    value: "opencode-cli",
    label: "OpenCode CLI",
    description: "Uses local opencode binary. Requires OpenCode installed and authenticated.",
  },
  {
    value: "openai-compatible",
    label: "OpenAI-Compatible API",
    description: "Any OpenAI-compatible endpoint (OpenAI, Azure, Ollama, etc.).",
  },
];

interface ProviderSettingsProps {
  onSettingsChange?: (settings: Settings) => void;
}

export default function ProviderSettings({ onSettingsChange }: ProviderSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(defaultProviderSettings);
  const [status, setStatus] = useState<ProviderStatus | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const loaded = loadProviderSettings();
    setSettings(loaded);
    onSettingsChange?.(loaded);
  }, [onSettingsChange]);

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        saveProviderSettings(next);
        onSettingsChange?.(next);
        return next;
      });
      setStatus(null);
    },
    [onSettingsChange],
  );

  const checkHealth = useCallback(async () => {
    setChecking(true);
    setStatus(null);

    try {
      const response = await fetch("/api/provider-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = (await response.json()) as ProviderStatus;
      setStatus(data);
    } catch {
      setStatus({
        provider: settings.provider,
        ok: false,
        message: "Failed to reach health-check endpoint",
      });
    } finally {
      setChecking(false);
    }
  }, [settings]);

  const option = PROVIDER_OPTIONS.find((o) => o.value === settings.provider);

  return (
    <div className="settings-wrapper">
      <button
        type="button"
        className="settings-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="provider-settings-panel"
      >
        <span className="settings-toggle__icon" aria-hidden="true" />
        <span className="settings-toggle__label">
          {option?.label ?? "Settings"}
        </span>
        <span className="settings-toggle__chevron" aria-hidden="true">
          {isOpen ? "\u25B4" : "\u25BE"}
        </span>
      </button>

      {isOpen && (
        <div id="provider-settings-panel" className="settings-panel" role="region" aria-label="Provider settings">
          <div className="settings-panel__header">
            <p className="panel-kicker">Configuration</p>
            <h2 className="section-title">Parser provider</h2>
          </div>

          <div className="settings-field">
            <label className="settings-label" htmlFor="provider-select">
              Provider
            </label>
            <select
              id="provider-select"
              className="settings-select"
              value={settings.provider}
              onChange={(e) => updateSettings({ provider: e.target.value as ProviderName })}
            >
              {PROVIDER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="settings-hint">{option?.description}</p>
          </div>

          {settings.provider === "claude-cli" && (
            <>
              <div className="settings-field">
                <label className="settings-label" htmlFor="claude-bin">
                  Binary path
                </label>
                <input
                  id="claude-bin"
                  className="settings-input"
                  type="text"
                  placeholder="claude"
                  value={settings.claudeBin ?? ""}
                  onChange={(e) => updateSettings({ claudeBin: e.target.value || undefined })}
                />
                <p className="settings-hint">Path to the claude CLI binary. Defaults to &quot;claude&quot;.</p>
              </div>
              <div className="settings-field">
                <label className="settings-label" htmlFor="claude-model">
                  Model
                </label>
                <input
                  id="claude-model"
                  className="settings-input"
                  type="text"
                  placeholder="sonnet"
                  value={settings.claudeModel ?? ""}
                  onChange={(e) => updateSettings({ claudeModel: e.target.value || undefined })}
                />
              </div>
            </>
          )}

          {settings.provider === "opencode-cli" && (
            <>
              <div className="settings-field">
                <label className="settings-label" htmlFor="opencode-bin">
                  Binary path
                </label>
                <input
                  id="opencode-bin"
                  className="settings-input"
                  type="text"
                  placeholder="opencode"
                  value={settings.opencodeBin ?? ""}
                  onChange={(e) => updateSettings({ opencodeBin: e.target.value || undefined })}
                />
                <p className="settings-hint">Path to the opencode CLI binary. Defaults to &quot;opencode&quot;.</p>
              </div>
              <div className="settings-field">
                <label className="settings-label" htmlFor="opencode-model">
                  Model
                </label>
                <input
                  id="opencode-model"
                  className="settings-input"
                  type="text"
                  placeholder="(default)"
                  value={settings.opencodeModel ?? ""}
                  onChange={(e) => updateSettings({ opencodeModel: e.target.value || undefined })}
                />
              </div>
            </>
          )}

          {settings.provider === "openai-compatible" && (
            <>
              <div className="settings-field">
                <label className="settings-label" htmlFor="openai-base-url">
                  Base URL
                </label>
                <input
                  id="openai-base-url"
                  className="settings-input"
                  type="url"
                  placeholder="https://api.openai.com/v1"
                  value={settings.openaiBaseUrl ?? ""}
                  onChange={(e) => updateSettings({ openaiBaseUrl: e.target.value || undefined })}
                />
              </div>
              <div className="settings-field">
                <label className="settings-label" htmlFor="openai-api-key">
                  API key
                </label>
                <input
                  id="openai-api-key"
                  className="settings-input"
                  type="password"
                  placeholder="sk-..."
                  value={settings.openaiApiKey ?? ""}
                  onChange={(e) => updateSettings({ openaiApiKey: e.target.value || undefined })}
                />
                <p className="settings-hint">Stored in browser only. Never sent to external servers.</p>
              </div>
              <div className="settings-field">
                <label className="settings-label" htmlFor="openai-model">
                  Model
                </label>
                <input
                  id="openai-model"
                  className="settings-input"
                  type="text"
                  placeholder="gpt-4o"
                  value={settings.openaiModel ?? ""}
                  onChange={(e) => updateSettings({ openaiModel: e.target.value || undefined })}
                />
              </div>
            </>
          )}

          <div className="settings-actions">
            <button
              type="button"
              className="settings-check-btn"
              onClick={checkHealth}
              disabled={checking}
            >
              {checking ? "Checking..." : "Check provider"}
            </button>

            <button
              type="button"
              className="settings-reset-btn"
              onClick={() => updateSettings(defaultProviderSettings)}
            >
              Reset
            </button>
          </div>

          {status && (
            <div className={`settings-status ${status.ok ? "settings-status--ok" : "settings-status--error"}`} role="status" aria-live="polite">
              <span className="settings-status__icon">{status.ok ? "\u2713" : "\u2717"}</span>
              <div>
                <p className="settings-status__message">{status.message}</p>
                {status.detail && <p className="settings-status__detail">{status.detail}</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
