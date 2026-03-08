import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const filesToCheck = [
  "README.md",
  ".env.example",
  "src/app/page.tsx",
  "src/components/FileUpload.tsx",
  "src/components/CVPreview.tsx",
  "src/app/api/parse-cv/route.ts",
];

const forbiddenPatterns = [
  /4\.231\.218\.96/,
  /Nico's Claude VM/,
  /Claude VM over SSH/,
  /ssh ubuntu@/,
];

const forbiddenPublicDocPatterns = [/CLAUDE_SSH_TARGET/, /CLAUDE_REMOTE_BIN/, /private remote runner/];

test("public repo copy does not expose private infrastructure details", async () => {
  for (const relativePath of filesToCheck) {
    const absolutePath = path.join(repoRoot, relativePath);
    const content = await readFile(absolutePath, "utf8");

    for (const pattern of forbiddenPatterns) {
      assert.equal(
        pattern.test(content),
        false,
        `${relativePath} contains forbidden infrastructure detail: ${pattern}`,
      );
    }
  }
});

test("public docs stay focused on local setup instead of private transport details", async () => {
  for (const relativePath of ["README.md", ".env.example"]) {
    const absolutePath = path.join(repoRoot, relativePath);
    const content = await readFile(absolutePath, "utf8");

    for (const pattern of forbiddenPublicDocPatterns) {
      assert.equal(
        pattern.test(content),
        false,
        `${relativePath} contains internal transport detail: ${pattern}`,
      );
    }
  }
});
