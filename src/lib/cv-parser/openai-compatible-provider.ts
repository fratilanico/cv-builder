import { buildCvParserPrompt } from "./prompt";
import { extractOpenAICompatibleText, stripJsonFence } from "./response";
import type { OpenAICompatibleParserConfig } from "./provider-config";

export async function parseWithOpenAICompatible(
  config: OpenAICompatibleParserConfig,
  extractedText: string,
): Promise<unknown> {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: buildCvParserPrompt(extractedText),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI-compatible provider request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  return JSON.parse(stripJsonFence(extractOpenAICompatibleText(payload)));
}
