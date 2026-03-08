import { parseWithClaudeCli, parseWithOpenCodeCli } from "./cli-provider";
import { parseWithOpenAICompatible } from "./openai-compatible-provider";
import { resolveParserConfig } from "./provider-config";

export { resolveParserConfig } from "./provider-config";
export { stripJsonFence, extractOpenAICompatibleText, extractOpencodeOutput } from "./response";

export async function structureCvData(
  extractedText: string,
  env: Record<string, string | undefined> = process.env,
): Promise<unknown> {
  const config = resolveParserConfig(env);

  switch (config.name) {
    case "claude-cli":
      return parseWithClaudeCli(config, extractedText);
    case "opencode-cli":
      return parseWithOpenCodeCli(config, extractedText);
    case "openai-compatible":
      return parseWithOpenAICompatible(config, extractedText);
  }
}
