export type ProviderName = "claude-cli" | "opencode-cli" | "openai-compatible";

export interface ProviderSettings {
  provider: ProviderName;
  // claude-cli
  claudeBin?: string;
  claudeModel?: string;
  // opencode-cli
  opencodeBin?: string;
  opencodeModel?: string;
  // openai-compatible
  openaiBaseUrl?: string;
  openaiApiKey?: string;
  openaiModel?: string;
}

export const defaultProviderSettings: ProviderSettings = {
  provider: "claude-cli",
};

export interface ProviderStatus {
  provider: ProviderName | "unknown";
  ok: boolean;
  message: string;
  detail?: string;
}

const STORAGE_KEY = "cv-builder-provider-settings";

export function loadProviderSettings(): ProviderSettings {
  if (typeof window === "undefined") return defaultProviderSettings;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultProviderSettings;

    const parsed = JSON.parse(stored) as Partial<ProviderSettings>;
    return { ...defaultProviderSettings, ...parsed };
  } catch {
    return defaultProviderSettings;
  }
}

export function saveProviderSettings(settings: ProviderSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
