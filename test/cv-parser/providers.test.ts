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

test("extractOpencodeOutput reads text from real opencode run --format json output", () => {
  const raw = [
    JSON.stringify({ type: "step_start", timestamp: 1, part: { type: "step-start", snapshot: "abc" } }),
    JSON.stringify({ type: "text", timestamp: 2, part: { type: "text", text: '{"name":"test"}' } }),
    JSON.stringify({ type: "step_finish", timestamp: 3, part: { type: "step-finish", reason: "stop", cost: 0 } }),
  ].join("\n");

  assert.equal(extractOpencodeOutput(raw), '{"name":"test"}');
});

test("extractOpencodeOutput concatenates multiple text events", () => {
  const raw = [
    JSON.stringify({ type: "text", part: { type: "text", text: '{"na' } }),
    JSON.stringify({ type: "text", part: { type: "text", text: 'me":"test"}' } }),
    JSON.stringify({ type: "step_finish", part: { type: "step-finish", reason: "stop" } }),
  ].join("\n");

  assert.equal(extractOpencodeOutput(raw), '{"name":"test"}');
});
