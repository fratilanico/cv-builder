import { spawn } from "node:child_process";
import { buildCvParserPrompt } from "./prompt";
import { extractOpencodeOutput, stripJsonFence } from "./response";
import type { ClaudeCliParserConfig, OpenCodeCliParserConfig } from "./provider-config";

const PARSER_TIMEOUT_MS = 180_000;

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}

async function runCommandWithInput(command: string, args: string[], input: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(command, args, {
      env: process.env,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`${command} timed out while structuring CV data`));
    }, PARSER_TIMEOUT_MS);

    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    child.on("close", (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        reject(new Error(stderr.trim() || `${command} exited with code ${code}`));
        return;
      }

      resolve({ stdout, stderr });
    });

    child.stdin.write(input);
    child.stdin.end();
  });
}

export async function parseWithClaudeCli(config: ClaudeCliParserConfig, extractedText: string): Promise<unknown> {
  const prompt = buildCvParserPrompt(extractedText);

  const { stdout, stderr } = config.sshTarget
    ? await runCommandWithInput(
        "ssh",
        [
          config.sshTarget,
          `${config.remoteBin} --print --output-format text --model ${shellQuote(config.model)} --tools ""`,
        ],
        prompt,
      )
    : config.command
      ? await runCommandWithInput(
          "bash",
          ["-lc", `${config.command} --print --output-format text --model ${shellQuote(config.model)} --tools ""`],
          prompt,
        )
      : await runCommandWithInput(
          config.bin,
          ["--print", "--output-format", "text", "--model", config.model, "--tools", ""],
          prompt,
        );

  const raw = stdout.trim();
  if (!raw) {
    throw new Error(`Claude CLI returned empty output${stderr ? `: ${stderr.trim()}` : ""}`);
  }

  return JSON.parse(stripJsonFence(raw));
}

export async function parseWithOpenCodeCli(config: OpenCodeCliParserConfig, extractedText: string): Promise<unknown> {
  const prompt = buildCvParserPrompt(extractedText);

  const { stdout } = config.command
    ? await runCommandWithInput("bash", ["-lc", `${config.command} ${shellQuote(prompt)}`], "")
    : await runCommandWithInput(
        config.bin,
        ["run", ...(config.model ? ["--model", config.model] : []), "--format", "json", prompt],
        "",
      );

  return JSON.parse(stripJsonFence(extractOpencodeOutput(stdout)));
}
