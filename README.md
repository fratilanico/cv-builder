# CV Builder

Open-source CV builder that accepts a `.pdf` or `.docx`, extracts the content, sends it through Claude running on your VM, and renders it into the dark Quanteam-style HTML/PDF template.

## What It Does

- Upload a Word or PDF CV
- Extract raw text from the file on the server
- Convert the content into a structured CV JSON model with Claude running locally on your VM
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

The app uses the local `claude` CLI on your VM, authenticated via your existing Claude Code OAuth/session setup.

Optional env vars:

```bash
CLAUDE_BIN=/Users/nico/.local/bin/claude
CLAUDE_MODEL=sonnet
```

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS 4
- Claude CLI on your VM
- `mammoth` for `.docx` extraction
- `pdf-parse` for `.pdf` extraction
- `html2canvas-pro` + `jspdf` for PDF export

## Notes

- The output template is intentionally fixed to the supplied dark CV structure.
- The server route shells out to `claude --print` with tools disabled, so it follows your VM-based Claude setup instead of direct vendor APIs.
- No Supabase or auth setup is required for this version.

## License

MIT. See `LICENSE`.
