import { NextRequest, NextResponse } from "next/server";
import { execFile, spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { promisify } from "node:util";
import type { CVData } from "@/types/cv";

export const maxDuration = 240;
const CLAUDE_TIMEOUT_MS = 180_000;

const execFileAsync = promisify(execFile);

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}

function slugify(value: string, fallback: string): string {
  const slug = value
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return slug || fallback;
}

function splitPeriod(period: string | undefined): { startDate: string; endDate: string } {
  if (!period) {
    return { startDate: "", endDate: "" };
  }

  const parts = period.split(/\s+[–-]\s+/);
  return {
    startDate: parts[0]?.trim() || "",
    endDate: parts.slice(1).join(" – ").trim(),
  };
}

function parseBullet(value: unknown): { label: string; text: string } {
  if (typeof value === "object" && value !== null) {
    const bullet = value as { label?: unknown; text?: unknown };
    return {
      label: typeof bullet.label === "string" ? bullet.label : "",
      text: typeof bullet.text === "string" ? bullet.text : "",
    };
  }

  if (typeof value !== "string") {
    return { label: "", text: "" };
  }

  const match = value.match(/^<strong>(.*?)<\/strong>\s*(.*)$/i);
  if (!match) {
    return { label: "", text: value };
  }

  return {
    label: match[1].trim(),
    text: match[2].trim(),
  };
}

function normalizeCvData(input: unknown): CVData {
  const raw = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;
  const personal = (typeof raw.personalDetails === "object" && raw.personalDetails !== null
    ? raw.personalDetails
    : {}) as Record<string, unknown>;

  const summary = Array.isArray(raw.summary)
    ? raw.summary.filter((item): item is string => typeof item === "string")
    : typeof raw.summary === "string" && raw.summary.trim()
      ? [raw.summary.trim()]
      : [];

  const skillCategories = Array.isArray(raw.skillCategories)
    ? raw.skillCategories.map((category, index) => {
        const cat = (typeof category === "object" && category !== null ? category : {}) as Record<string, unknown>;
        const title = typeof cat.title === "string" ? cat.title : `CATEGORY ${index + 1}`;
        const items = typeof cat.items === "string"
          ? cat.items
          : Array.isArray(cat.skills)
            ? cat.skills.filter((item): item is string => typeof item === "string").join(", ")
            : "";

        return {
          id: typeof cat.id === "string" ? cat.id : `skill-${slugify(title, `category-${index + 1}`)}`,
          title,
          items,
        };
      })
    : [];

  const projects = Array.isArray(raw.projects)
    ? raw.projects.map((project, index) => {
        const proj = (typeof project === "object" && project !== null ? project : {}) as Record<string, unknown>;
        const name = typeof proj.name === "string" ? proj.name : `Project ${index + 1}`;
        const bulletsRaw = Array.isArray(proj.bullets) ? proj.bullets : [];

        return {
          id: typeof proj.id === "string" ? proj.id : `proj-${slugify(name, `project-${index + 1}`)}`,
          name,
          tag: typeof proj.tag === "string" ? proj.tag : typeof proj.subtitle === "string" ? proj.subtitle : "",
          bullets: bulletsRaw.map(parseBullet).filter((bullet) => bullet.label || bullet.text),
        };
      })
    : [];

  const experience = Array.isArray(raw.experience)
    ? raw.experience.map((item, index) => {
        const exp = (typeof item === "object" && item !== null ? item : {}) as Record<string, unknown>;
        const company = typeof exp.company === "string" ? exp.company : `Company ${index + 1}`;
        const { startDate, endDate } = splitPeriod(typeof exp.period === "string" ? exp.period : undefined);
        const bulletsRaw = Array.isArray(exp.bullets) ? exp.bullets : [];

        return {
          id: typeof exp.id === "string" ? exp.id : `exp-${slugify(company, `experience-${index + 1}`)}`,
          company,
          role: typeof exp.role === "string" ? exp.role : "",
          type: typeof exp.type === "string" ? exp.type : "",
          startDate: typeof exp.startDate === "string" ? exp.startDate : startDate,
          endDate: typeof exp.endDate === "string" ? exp.endDate : endDate,
          subRoles: Array.isArray(exp.subRoles)
            ? exp.subRoles.map((subRole) => {
                const sub = (typeof subRole === "object" && subRole !== null ? subRole : {}) as Record<string, unknown>;
                return {
                  title: typeof sub.title === "string" ? sub.title : "",
                  bullets: Array.isArray(sub.bullets)
                    ? sub.bullets.map(parseBullet).filter((bullet) => bullet.label || bullet.text)
                    : [],
                };
              })
            : [],
          bullets: bulletsRaw.map(parseBullet).filter((bullet) => bullet.label || bullet.text),
        };
      })
    : [];

  const footerValue = raw.footer;
  const footer = Array.isArray(footerValue)
    ? footerValue
        .map((column) => {
          const col = (typeof column === "object" && column !== null ? column : {}) as Record<string, unknown>;
          return {
            heading: typeof col.heading === "string" ? col.heading : "",
            lines: Array.isArray(col.lines)
              ? col.lines.filter((line): line is string => typeof line === "string")
              : [],
          };
        })
        .filter((column) => column.heading || column.lines.length > 0)
    : typeof footerValue === "object" && footerValue !== null
      ? Object.entries(footerValue as Record<string, unknown>).map(([heading, value]) => {
          const lines = Array.isArray(value)
            ? value.flatMap((entry) => {
                if (typeof entry === "string") {
                  return [entry];
                }
                if (typeof entry === "object" && entry !== null) {
                  return Object.values(entry)
                    .filter((item): item is string => typeof item === "string");
                }
                return [];
              })
            : [];

          return {
            heading,
            lines,
          };
        })
      : [];

  return {
    personalDetails: {
      fullName: typeof personal.fullName === "string" ? personal.fullName : typeof personal.name === "string" ? personal.name : "",
      title: typeof personal.title === "string" ? personal.title : "",
      location: typeof personal.location === "string" ? personal.location : "",
      phone: typeof personal.phone === "string" ? personal.phone : "",
      email: typeof personal.email === "string" ? personal.email : "",
      linkedin: typeof personal.linkedin === "string" ? personal.linkedin : "",
      github: typeof personal.github === "string" ? personal.github : "",
    },
    summary,
    strategicPhilosophy: typeof raw.strategicPhilosophy === "string" ? raw.strategicPhilosophy : "",
    skillCategories,
    techTags: Array.isArray(raw.techTags)
      ? raw.techTags.filter((tag): tag is string => typeof tag === "string")
      : [],
    projects,
    experience,
    footer,
  };
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(buffer);
  return data.text;
}

async function extractTextFromPdfWithOcr(buffer: Buffer): Promise<string> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "cv-builder-ocr-"));
  const tempPdfPath = path.join(tempDir, "upload.pdf");
  const ocrScriptPath = path.join(process.cwd(), "scripts", "ocr_pdf.swift");

  try {
    await writeFile(tempPdfPath, buffer);
    const { stdout, stderr } = await execFileAsync(
      "swift",
      [ocrScriptPath, tempPdfPath],
      {
        timeout: 60_000,
        maxBuffer: 10 * 1024 * 1024,
      }
    );

    const text = stdout.trim();
    if (!text) {
      throw new Error(stderr.trim() || "OCR produced no text");
    }

    return text;
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function structureCvWithClaudeCli(extractedText: string) {
  const claudeBin = process.env.CLAUDE_BIN || "claude";
  const claudeModel = process.env.CLAUDE_MODEL || "sonnet";
  const claudeCommand = process.env.CLAUDE_COMMAND?.trim();
  const claudeSshTarget = process.env.CLAUDE_SSH_TARGET?.trim();
  const claudeRemoteBin = process.env.CLAUDE_REMOTE_BIN?.trim() || "claude";

  const prompt = [
    "<system>",
    "You are an APEX OS CV parsing worker running on Nico's Claude VM.",
    "Context: raw CV text was extracted from an uploaded PDF or DOCX file.",
    "Task: transform that raw text into structured JSON for a fixed dark Quanteam-style CV template.",
    "Guardrails:",
    "- Preserve facts from the source CV. Do not invent employers, dates, metrics, or projects.",
    "- Use only safe inline tags: <strong> and <code> inside string fields when emphasis is useful.",
    "- Keep output machine-parseable JSON only.",
    "- If data is missing, use an empty string or empty array.",
    "</system>",
    "",
    "<user>",
    "Return JSON for the provided schema.",
    "Map the CV into these sections: personalDetails, summary, strategicPhilosophy, skillCategories, techTags, projects, experience, footer.",
    "Use 2-4 skill categories where possible.",
    "For promotions within one company, use subRoles.",
    "For single-role companies, use top-level bullets.",
    "Think step by step before answering, but output only the final JSON.",
    "",
    "CV TEXT:",
    extractedText,
    "</user>",
  ].join("\n");

  const { stdout, stderr } = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    const child = claudeSshTarget
      ? spawn(
          "ssh",
          [
            claudeSshTarget,
            `${claudeRemoteBin} --print --output-format text --model ${shellQuote(claudeModel)} --tools \"\"`,
          ],
          {
            env: process.env,
            stdio: ["pipe", "pipe", "pipe"],
          }
        )
      : claudeCommand
      ? spawn(
          "bash",
          [
            "-lc",
            `${claudeCommand} --print --output-format text --model ${shellQuote(claudeModel)} --tools \"\"`,
          ],
          {
            env: process.env,
            stdio: ["pipe", "pipe", "pipe"],
          }
        )
      : spawn(
          claudeBin,
          [
            "--print",
            "--output-format",
            "text",
            "--model",
            claudeModel,
            "--tools",
            "",
          ],
          {
            env: process.env,
            stdio: ["pipe", "pipe", "pipe"],
          }
        );

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
      reject(new Error("Claude CLI timed out while structuring CV data"));
    }, CLAUDE_TIMEOUT_MS);

    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    child.on("close", (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        reject(new Error(stderr.trim() || `Claude CLI exited with code ${code}`));
        return;
      }

      resolve({ stdout, stderr });
    });

    child.stdin.write(prompt);
    child.stdin.end();
  });

  const raw = stdout.trim();
  if (!raw) {
    throw new Error(`Claude CLI returned empty output${stderr ? `: ${stderr.trim()}` : ""}`);
  }

  const jsonText = raw.startsWith("```")
    ? raw.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "")
    : raw;

  return JSON.parse(jsonText);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let extractedText: string;

    if (file.type === "application/pdf") {
      extractedText = await extractTextFromPDF(buffer);
      if (!extractedText.trim()) {
        extractedText = await extractTextFromPdfWithOcr(buffer);
      }
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      extractedText = await extractTextFromDOCX(buffer);
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF or DOCX file." },
        { status: 400 }
      );
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from the uploaded file." },
        { status: 400 }
      );
    }

    const cvData = normalizeCvData(await structureCvWithClaudeCli(extractedText));

    return NextResponse.json({ cvData });
  } catch (error) {
    console.error("CV parsing error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to parse CV",
      },
      { status: 500 }
    );
  }
}
