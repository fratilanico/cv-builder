import test from "node:test";
import assert from "node:assert/strict";
import { resolveParserConfig } from "../../src/lib/cv-parser/provider-config";

test("defaults to claude-cli when no provider is configured", () => {
  const config = resolveParserConfig({});

  assert.equal(config.name, "claude-cli");
  assert.equal(config.model, "sonnet");
  assert.equal(config.bin, "claude");
});

test("resolves opencode-cli when explicitly configured", () => {
  const config = resolveParserConfig({
    CV_PARSER_PROVIDER: "opencode-cli",
    OPENCODE_BIN: "opencode",
    OPENCODE_MODEL: "openai/gpt-5.4",
  });

  assert.equal(config.name, "opencode-cli");
  assert.equal(config.bin, "opencode");
  assert.equal(config.model, "openai/gpt-5.4");
});

test("openai-compatible requires api key and model", () => {
  assert.throws(
    () => resolveParserConfig({ CV_PARSER_PROVIDER: "openai-compatible" }),
    /OPENAI_API_KEY/,
  );
});

test("resolves openai-compatible provider with required config", () => {
  const config = resolveParserConfig({
    CV_PARSER_PROVIDER: "openai-compatible",
    OPENAI_API_KEY: "test-key",
    OPENAI_MODEL: "gpt-4.1-mini",
    OPENAI_BASE_URL: "https://example.com/v1",
  });

  assert.equal(config.name, "openai-compatible");
  assert.equal(config.model, "gpt-4.1-mini");
  assert.equal(config.baseUrl, "https://example.com/v1");
});
