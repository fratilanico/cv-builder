# Editorial Cyber Terminal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade the CV Builder shell into a premium editorial cyber-terminal experience without changing the core upload -> parse -> preview -> export flow.

**Architecture:** Keep the current route structure and data flow intact, but replace the flat inline shell styling with a cohesive control-deck layout, stronger information hierarchy, improved upload interactions, and a framed preview stage. Preserve the actual CV renderer behavior for successful parses while making the empty and pre-upload states feel intentional.

**Tech Stack:** Next.js App Router, React client components, Tailwind/global CSS, agent-browser QA.

---

### Task 1: Reshape the shell layout

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`

**Step 1: Replace flat header and side rail markup**
- Add a tighter header with title, signal copy, and status chips.
- Add a left control-deck column with grouped cards instead of raw stacked boxes.

**Step 2: Add a framed preview stage**
- Wrap the preview in a stage shell with a caption and frame treatment.

**Step 3: Keep mobile-first responsiveness explicit**
- Ensure the rail stacks above the preview on smaller viewports.

### Task 2: Upgrade upload UX

**Files:**
- Modify: `src/components/FileUpload.tsx`
- Modify: `src/app/globals.css`

**Step 1: Replace the clickable div pattern with a proper button-led interaction**
- Keep drag/drop support.
- Add clearer helper copy and supported-format messaging.

**Step 2: Improve loading and success states**
- Surface file name, processing state, and confidence cues.

### Task 3: Improve empty preview presentation

**Files:**
- Modify: `src/components/CVPreview.tsx`

**Step 1: Add a premium empty state**
- Introduce a staged empty canvas with grid/glow treatment and short instructional copy.

### Task 4: Polish affordances

**Files:**
- Modify: `src/components/PDFExportButton.tsx`
- Modify: `src/app/globals.css`

**Step 1: Upgrade button, hover, and focus treatments**
- Avoid `transition: all`.
- Use visible focus styling and better disabled states.

### Task 5: Verify in browser

**Files:**
- No code changes required if green

**Step 1: Run lint and build**
- Run: `npm run lint`
- Run: `npm run build`

**Step 2: Run browser smoke checks**
- Load desktop shell
- Load mobile shell
- Verify empty state, upload rail, and header hierarchy
