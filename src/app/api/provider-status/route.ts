import { NextRequest, NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { ProviderName, ProviderSettings, ProviderStatus } from "@/types/provider";

const execFileAsync = promisify(execFile);

const HEALTH_TIMEOUT_MS = 15_000;

function isProviderSettings(body: unknown): body is ProviderSettings {
  return (
    typeof body === "object" &&
    body !== null &&
    "provider" in body &&
    typeof (body as Record<string, unknown>).provider === "string"
  );
}

async function checkClaudeCli(settings: ProviderSettings): Promise<ProviderStatus> {
  const bin = settings.claudeBin || "claude";

  try {
    const { stdout } = await execFileAsync(bin, ["--version"], {
      timeout: HEALTH_TIMEOUT_MS,
      env: process.env,
    });

    return {
      provider: "claude-cli",
      ok: true,
      message: "Claude CLI is reachable",
      detail: stdout.trim().split("\n")[0],
    };
  } catch (error) {
    const message =
      error instanceof Error && "code" in error && (error as NodeJS.ErrnoException).code === "ENOENT"
        ? `Binary "${bin}" not found. Install Claude CLI or set the correct path.`
        : error instanceof Error
          ? error.message
          : "Unknown error checking Claude CLI";

    return {
      provider: "claude-cli",
      ok: false,
      message: "Claude CLI is not reachable",
      detail: message,
    };
  }
}

async function checkOpenCodeCli(settings: ProviderSettings): Promise<ProviderStatus> {
  const bin = settings.opencodeBin || "opencode";

  try {
    const { stdout } = await execFileAsync(bin, ["--version"], {
      timeout: HEALTH_TIMEOUT_MS,
      env: process.env,
    });

    return {
      provider: "opencode-cli",
      ok: true,
      message: "OpenCode CLI is reachable",
      detail: stdout.trim().split("\n")[0],
    };
  } catch (error) {
    const message =
      error instanceof Error && "code" in error && (error as NodeJS.ErrnoException).code === "ENOENT"
        ? `Binary "${bin}" not found. Install OpenCode or set the correct path.`
        : error instanceof Error
          ? error.message
          : "Unknown error checking OpenCode CLI";

    return {
      provider: "opencode-cli",
      ok: false,
      message: "OpenCode CLI is not reachable",
      detail: message,
    };
  }
}

async function checkOpenAICompatible(settings: ProviderSettings): Promise<ProviderStatus> {
  const baseUrl = (settings.openaiBaseUrl || "https://api.openai.com/v1").replace(/\/$/, "");
  const apiKey = settings.openaiApiKey;
  const model = settings.openaiModel;

  if (!apiKey) {
    return {
      provider: "openai-compatible",
      ok: false,
      message: "API key is required",
      detail: "Enter an API key in the settings panel.",
    };
  }

  if (!model) {
    return {
      provider: "openai-compatible",
      ok: false,
      message: "Model name is required",
      detail: "Enter a model name (e.g., gpt-4o) in the settings panel.",
    };
  }

  try {
    const response = await fetch(`${baseUrl}/models`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return {
        provider: "openai-compatible",
        ok: false,
        message: `API returned ${response.status}`,
        detail: text.slice(0, 200) || `HTTP ${response.status} from ${baseUrl}`,
      };
    }

    return {
      provider: "openai-compatible",
      ok: true,
      message: "API endpoint is reachable and authenticated",
      detail: `${baseUrl} / model: ${model}`,
    };
  } catch (error) {
    return {
      provider: "openai-compatible",
      ok: false,
      message: "Cannot reach API endpoint",
      detail: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    if (!isProviderSettings(body)) {
      return NextResponse.json(
        { provider: "unknown", ok: false, message: "Invalid request body" } satisfies ProviderStatus,
        { status: 400 },
      );
    }

    let result: ProviderStatus;

    switch (body.provider) {
      case "claude-cli":
        result = await checkClaudeCli(body);
        break;
      case "opencode-cli":
        result = await checkOpenCodeCli(body);
        break;
      case "openai-compatible":
        result = await checkOpenAICompatible(body);
        break;
      default:
        result = {
          provider: body.provider,
          ok: false,
          message: `Unsupported provider: ${body.provider}`,
        };
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        provider: "unknown",
        ok: false,
        message: error instanceof Error ? error.message : "Health check failed",
      } satisfies ProviderStatus,
      { status: 500 },
    );
  }
}
