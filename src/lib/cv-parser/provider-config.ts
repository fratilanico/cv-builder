export type ParserProviderName = "claude-cli" | "opencode-cli" | "openai-compatible";

type EnvMap = Record<string, string | undefined>;

export interface ClaudeCliParserConfig {
  name: "claude-cli";
  bin: string;
  model: string;
  command?: string;
  sshTarget?: string;
  remoteBin: string;
}

export interface OpenCodeCliParserConfig {
  name: "opencode-cli";
  bin: string;
  model?: string;
  command?: string;
}

export interface OpenAICompatibleParserConfig {
  name: "openai-compatible";
  baseUrl: string;
  apiKey: string;
  model: string;
}

export type ParserProviderConfig =
  | ClaudeCliParserConfig
  | OpenCodeCliParserConfig
  | OpenAICompatibleParserConfig;

function getTrimmed(env: EnvMap, key: string): string | undefined {
  const value = env[key]?.trim();
  return value ? value : undefined;
}

export function resolveParserConfig(env: EnvMap): ParserProviderConfig {
  const provider = getTrimmed(env, "CV_PARSER_PROVIDER") ?? "claude-cli";

  switch (provider) {
    case "claude-cli":
      return {
        name: "claude-cli",
        bin: getTrimmed(env, "CLAUDE_BIN") ?? "claude",
        model: getTrimmed(env, "CLAUDE_MODEL") ?? "sonnet",
        command: getTrimmed(env, "CLAUDE_COMMAND"),
        sshTarget: getTrimmed(env, "CLAUDE_SSH_TARGET"),
        remoteBin: getTrimmed(env, "CLAUDE_REMOTE_BIN") ?? "claude",
      };
    case "opencode-cli":
      return {
        name: "opencode-cli",
        bin: getTrimmed(env, "OPENCODE_BIN") ?? "opencode",
        model: getTrimmed(env, "OPENCODE_MODEL"),
        command: getTrimmed(env, "OPENCODE_COMMAND"),
      };
    case "openai-compatible": {
      const apiKey = getTrimmed(env, "OPENAI_API_KEY");
      const model = getTrimmed(env, "OPENAI_MODEL");

      if (!apiKey) {
        throw new Error("OPENAI_API_KEY is required when CV_PARSER_PROVIDER=openai-compatible");
      }

      if (!model) {
        throw new Error("OPENAI_MODEL is required when CV_PARSER_PROVIDER=openai-compatible");
      }

      return {
        name: "openai-compatible",
        apiKey,
        model,
        baseUrl: (getTrimmed(env, "OPENAI_BASE_URL") ?? "https://api.openai.com/v1").replace(/\/$/, ""),
      };
    }
    default:
      throw new Error(`Unsupported CV parser provider: ${provider}`);
  }
}
