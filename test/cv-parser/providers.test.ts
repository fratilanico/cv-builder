import test from "node:test";
import assert from "node:assert/strict";
import {
  stripJsonFence,
  extractOpenAICompatibleText,
  extractOpencodeOutput,
} from "../../src/lib/cv-parser";

test("stripJsonFence removes fenced json wrappers", () => {
  const raw = '```json\n{"ok":true}\n```';

  assert.equal(stripJsonFence(raw), '{"ok":true}');
});

test("extractOpenAICompatibleText reads string message content", () => {
  const raw = {
    choices: [{ message: { content: '{"provider":"openai-compatible"}' } }],
  };

  assert.equal(extractOpenAICompatibleText(raw), '{"provider":"openai-compatible"}');
});

test("extractOpencodeOutput reads assistant text from json event output", () => {
  const raw = [
    JSON.stringify({ type: "event", text: "ignore me" }),
    JSON.stringify({
      type: "assistant",
      message: {
        content: [{ type: "text", text: '{"provider":"opencode-cli"}' }],
      },
    }),
  ].join("\n");

  assert.equal(extractOpencodeOutput(raw), '{"provider":"opencode-cli"}');
});
