# CV Builder

Open-source CV builder that accepts a `.pdf` or `.docx`, extracts the content, sends it through a configurable local or API-backed parser, and renders it into the dark Quanteam-style HTML/PDF template.

## What It Does

- Upload a Word or PDF CV
- Extract raw text from the file on the server
- Convert the content into a structured CV JSON model through a selectable parser provider
- Render the result in the fixed dark template from the supplied reference CV
- Export the preview back to PDF in the same structure

## Quick Start

```bash
git clone https://github.com/fratilanico/cv-builder.git
cd cv-builder
cp .env.example .env.local
# optional: point to your Claude CLI binary/model if needed
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Choose a provider with `CV_PARSER_PROVIDER`.

```bash
CV_PARSER_PROVIDER=claude-cli

# Claude Code / local Claude CLI
CLAUDE_BIN=claude
CLAUDE_MODEL=sonnet

# OpenCode CLI
OPENCODE_BIN=opencode
OPENCODE_MODEL=openai/gpt-5.4

# OpenAI-compatible APIs
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
```

Supported providers:

- `claude-cli` - local Claude Code / Claude CLI session
- `opencode-cli` - local OpenCode session
- `openai-compatible` - any API that supports the OpenAI chat completions shape

For local-first usage, `claude-cli` and `opencode-cli` rely on the user already being authenticated in their own environment.

For API-backed usage, some OpenAI-compatible providers may offer free developer credits or free-tier access at times; examples to evaluate yourself include OpenRouter, Groq, and Cerebras. Treat pricing and free availability as provider-specific and subject to change.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS 4
- Claude CLI / OpenCode / OpenAI-compatible APIs
- `mammoth` for `.docx` extraction
- `pdf-parse` for `.pdf` extraction
- `html2canvas-pro` + `jspdf` for PDF export

## Notes

- The output template is intentionally fixed to the supplied dark CV structure.
- The server route now resolves a parser adapter from `CV_PARSER_PROVIDER`, so users can switch providers without changing route code.
- Advanced transport overrides may still exist internally for private setups, but they are intentionally not part of the public quick-start surface.
- No Supabase or auth setup is required for this version.

## License

MIT. See `LICENSE`.
