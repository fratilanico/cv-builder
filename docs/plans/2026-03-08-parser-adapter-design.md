# Parser Adapter Design

**Problem:** `src/app/api/parse-cv/route.ts` currently hardcodes one Claude-oriented execution path, which keeps the public app tied to a single local process and leaves internal transport details too close to product-facing behavior.

**Decision:** Introduce a parser adapter layer that keeps file extraction and CV normalization in the route, but moves model invocation behind a provider contract. The public app stays simple while users can choose a local CLI flow or an API-key-backed flow through environment configuration.

## Recommended Approach

Ship three providers in v1:

1. `claude-cli`
2. `opencode-cli`
3. `openai-compatible`

This gives immediate support for the two local-agent paths you explicitly want, plus a generic API-backed option for users who prefer hosted models.

## Architecture

- Keep `/api/parse-cv` as the only route.
- Extract provider resolution into `src/lib/cv-parser/`.
- Define a small provider config contract that resolves from environment variables.
- Define one shared prompt builder so all providers use the same schema instructions.
- Keep `normalizeCvData()` in the route for now to avoid over-refactoring unrelated behavior.

## Provider Contract

Each provider receives raw extracted CV text and returns parsed JSON-compatible data.

Expected shape:

```ts
type ParserProviderName = "claude-cli" | "opencode-cli" | "openai-compatible";

interface ParserProviderConfig {
  name: ParserProviderName;
  model?: string;
}

interface ParserProvider {
  parse(extractedText: string): Promise<unknown>;
}
```

## Environment Surface

Public docs should focus on these primary envs:

```bash
CV_PARSER_PROVIDER=claude-cli
CLAUDE_BIN=claude
CLAUDE_MODEL=sonnet
OPENCODE_BIN=opencode
OPENCODE_MODEL=
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_API_KEY=
OPENAI_MODEL=
```

Advanced private transport envs may still exist internally for backward compatibility, but they should stay undocumented in the public setup.

## Error Handling

- Unsupported provider -> clear 500 with provider name.
- Missing provider credentials/config -> clear 500 with actionable message.
- Empty/invalid model output -> provider-specific parse error.
- Route keeps current file validation and extraction errors unchanged.

## Testing

- Add provider resolution tests.
- Add config validation tests for missing API keys/model requirements.
- Add CLI output parsing tests for fenced JSON cleanup.
- Keep public-doc redaction tests and expand them for the new provider-facing docs.

## Success Criteria

- Users can choose parser provider without editing route logic.
- Public docs describe local CLI and API-backed usage without mentioning private SSH transport.
- Existing upload -> parse -> normalize -> preview flow still works.
- Test, lint, and build all pass.
