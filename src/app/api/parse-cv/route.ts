import { NextRequest, NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

export const maxDuration = 60;

const execFileAsync = promisify(execFile);

const CV_JSON_SCHEMA = JSON.stringify({
  type: "object",
  additionalProperties: false,
  required: [
    "personalDetails",
    "summary",
    "strategicPhilosophy",
    "skillCategories",
    "techTags",
    "projects",
    "experience",
    "footer",
  ],
  properties: {
    personalDetails: {
      type: "object",
      additionalProperties: false,
      required: ["fullName", "title", "location", "phone", "email", "linkedin", "github"],
      properties: {
        fullName: { type: "string" },
        title: { type: "string" },
        location: { type: "string" },
        phone: { type: "string" },
        email: { type: "string" },
        linkedin: { type: "string" },
        github: { type: "string" },
      },
    },
    summary: { type: "array", items: { type: "string" } },
    strategicPhilosophy: { type: "string" },
    skillCategories: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "title", "items"],
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          items: { type: "string" },
        },
      },
    },
    techTags: { type: "array", items: { type: "string" } },
    projects: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "name", "tag", "bullets"],
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          tag: { type: "string" },
          bullets: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["label", "text"],
              properties: {
                label: { type: "string" },
                text: { type: "string" },
              },
            },
          },
        },
      },
    },
    experience: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "company", "role", "type", "startDate", "endDate", "subRoles", "bullets"],
        properties: {
          id: { type: "string" },
          company: { type: "string" },
          role: { type: "string" },
          type: { type: "string" },
          startDate: { type: "string" },
          endDate: { type: "string" },
          subRoles: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["title", "bullets"],
              properties: {
                title: { type: "string" },
                bullets: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: ["label", "text"],
                    properties: {
                      label: { type: "string" },
                      text: { type: "string" },
                    },
                  },
                },
              },
            },
          },
          bullets: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["label", "text"],
              properties: {
                label: { type: "string" },
                text: { type: "string" },
              },
            },
          },
        },
      },
    },
    footer: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["heading", "lines"],
        properties: {
          heading: { type: "string" },
          lines: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
});

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(buffer);
  return data.text;
}

async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function structureCvWithClaudeCli(extractedText: string) {
  const claudeBin = process.env.CLAUDE_BIN || "claude";
  const claudeModel = process.env.CLAUDE_MODEL || "sonnet";

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

  const { stdout, stderr } = await execFileAsync(
    claudeBin,
    [
      "--print",
      "--output-format",
      "text",
      "--model",
      claudeModel,
      "--json-schema",
      CV_JSON_SCHEMA,
      "--tools",
      "",
      prompt,
    ],
    {
      timeout: 55_000,
      maxBuffer: 10 * 1024 * 1024,
      env: process.env,
    }
  );

  const raw = stdout.trim();
  if (!raw) {
    throw new Error(`Claude CLI returned empty output${stderr ? `: ${stderr.trim()}` : ""}`);
  }

  return JSON.parse(raw);
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

    const cvData = await structureCvWithClaudeCli(extractedText);

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
