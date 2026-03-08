# Parser Adapter Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a provider adapter layer so CV parsing can run through Claude CLI, OpenCode CLI, or an OpenAI-compatible API without changing the UI flow.

**Architecture:** Keep extraction and normalization in `src/app/api/parse-cv/route.ts`, but move prompt generation, provider selection, and provider execution into `src/lib/cv-parser/`. Preserve the existing route response shape while making the parser backend configurable through a stable adapter contract.

**Tech Stack:** Next.js App Router, TypeScript, node:test via `tsx`, local CLI subprocesses, fetch-based OpenAI-compatible API calls.

---

### Task 1: Add test infrastructure for TypeScript parser tests

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

**Step 1: Write the failing test**

Create `test/cv-parser/provider-config.test.ts` that imports a not-yet-created provider resolver.

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { resolveParserConfig } from "../../src/lib/cv-parser/provider-config";

test("defaults to claude-cli", () => {
  assert.equal(resolveParserConfig({}).name, "claude-cli");
});
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL with module not found for `provider-config`

**Step 3: Add minimal test runner support**

Add `tsx` dev dependency and switch the `test` script to `tsx --test test/**/*.test.ts test/**/*.test.mjs`.

**Step 4: Run test to verify it still fails for the right reason**

Run: `npm test`
Expected: FAIL because parser config module still does not exist

### Task 2: Add provider resolution and validation

**Files:**
- Create: `src/lib/cv-parser/provider-config.ts`
- Test: `test/cv-parser/provider-config.test.ts`

**Step 1: Write the failing tests**

Cover:
- default provider is `claude-cli`
- explicit `opencode-cli` is resolved
- `openai-compatible` requires `OPENAI_API_KEY` and `OPENAI_MODEL`

**Step 2: Run test to verify it fails**

Run: `npm test -- test/cv-parser/provider-config.test.ts`
Expected: FAIL with unresolved import or missing export

**Step 3: Write minimal implementation**

Implement `resolveParserConfig(env)` returning a typed provider config and throwing actionable errors for invalid API config.

**Step 4: Run test to verify it passes**

Run: `npm test -- test/cv-parser/provider-config.test.ts`
Expected: PASS

### Task 3: Add prompt builder and provider execution helpers

**Files:**
- Create: `src/lib/cv-parser/prompt.ts`
- Create: `src/lib/cv-parser/providers.ts`
- Create: `src/lib/cv-parser/cli-provider.ts`
- Create: `src/lib/cv-parser/openai-compatible-provider.ts`
- Test: `test/cv-parser/providers.test.ts`

**Step 1: Write the failing tests**

Cover:
- fenced JSON output is cleaned correctly
- claude-cli provider builds a CLI command path
- opencode-cli provider builds an OpenCode command path
- openai-compatible provider extracts message content from API response JSON

**Step 2: Run test to verify it fails**

Run: `npm test -- test/cv-parser/providers.test.ts`
Expected: FAIL because provider helpers do not exist yet

**Step 3: Write minimal implementation**

Implement:
- shared prompt builder
- shared JSON cleanup helper
- CLI runner helper
- provider factory for `claude-cli`, `opencode-cli`, and `openai-compatible`

**Step 4: Run test to verify it passes**

Run: `npm test -- test/cv-parser/providers.test.ts`
Expected: PASS

### Task 4: Wire the route to the adapter layer

**Files:**
- Modify: `src/app/api/parse-cv/route.ts`
- Test: `test/cv-parser/route-contract.test.ts`

**Step 1: Write the failing test**

Add a contract-oriented test for the route helper layer that proves normalized output still comes back after provider selection.

**Step 2: Run test to verify it fails**

Run: `npm test -- test/cv-parser/route-contract.test.ts`
Expected: FAIL because route still calls Claude-specific logic directly

**Step 3: Write minimal implementation**

Replace `structureCvWithClaudeCli()` with adapter-driven `structureCvData()` while preserving extraction, OCR fallback, and normalization behavior.

**Step 4: Run test to verify it passes**

Run: `npm test -- test/cv-parser/route-contract.test.ts`
Expected: PASS

### Task 5: Update public docs and env examples

**Files:**
- Modify: `README.md`
- Modify: `.env.example`
- Modify: `test/public-infra-redaction.test.mjs`

**Step 1: Write the failing test**

Expand the existing public-surface test so docs must mention provider selection and must not mention internal transport details.

**Step 2: Run test to verify it fails**

Run: `npm test -- test/public-infra-redaction.test.mjs`
Expected: FAIL until docs are updated

**Step 3: Write minimal implementation**

Document:
- provider selection
- Claude Code / OpenCode local CLI usage
- OpenAI-compatible API usage
- examples of providers with free developer credits, carefully worded as examples not guarantees

**Step 4: Run test to verify it passes**

Run: `npm test -- test/public-infra-redaction.test.mjs`
Expected: PASS

### Task 6: Full verification and push

**Files:**
- No new code required if green

**Step 1: Run full verification**

Run: `npm test`
Expected: PASS

Run: `npm run lint`
Expected: PASS

Run: `npm run build`
Expected: PASS

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add configurable cv parser providers"
```

**Step 3: Push**

```bash
git push origin main
```
