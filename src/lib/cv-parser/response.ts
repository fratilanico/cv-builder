function extractTextCandidate(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || undefined;
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((item) => extractTextCandidate(item))
      .filter((item): item is string => Boolean(item));

    return parts.length > 0 ? parts.join("\n").trim() : undefined;
  }

  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  const priorityKeys = ["output_text", "content", "text", "message", "response", "result"];

  for (const key of priorityKeys) {
    const candidate = extractTextCandidate(record[key]);
    if (candidate) {
      return candidate;
    }
  }

  for (const nested of Object.values(record)) {
    const candidate = extractTextCandidate(nested);
    if (candidate) {
      return candidate;
    }
  }

  return undefined;
}

export function stripJsonFence(raw: string): string {
  return raw.startsWith("```")
    ? raw.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "")
    : raw;
}

export function extractOpenAICompatibleText(payload: unknown): string {
  const choices =
    typeof payload === "object" && payload !== null && Array.isArray((payload as { choices?: unknown }).choices)
      ? (payload as { choices: unknown[] }).choices
      : [];

  const candidate = extractTextCandidate(choices[0]);
  if (!candidate) {
    throw new Error("OpenAI-compatible provider returned no assistant message content");
  }

  return candidate;
}

export function extractOpencodeOutput(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error("OpenCode returned empty output");
  }

  const lines = trimmed.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  for (let index = lines.length - 1; index >= 0; index -= 1) {
    try {
      const parsed = JSON.parse(lines[index]) as unknown;
      const candidate = extractTextCandidate(parsed);
      if (candidate) {
        return candidate;
      }
    } catch {
      continue;
    }
  }

  return trimmed;
}
