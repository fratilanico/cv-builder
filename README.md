# 🧑‍💼 AI-Powered CV Builder

> Open-source CV builder with Claude AI enhancement — built live at the APEX OS Webinar

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![Claude AI](https://img.shields.io/badge/Claude-AI-CC785C?style=flat-square)](https://anthropic.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## 🚀 Quick Start

```bash
git clone https://github.com/fratilanico/cv-builder.git
cd cv-builder
cp .env.example .env.local
# Add your Supabase + Anthropic API keys to .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 Full Build Guide

This project was built live in a 1.5-hour webinar session.

**Complete step-by-step guide:** [github.com/fratilanico/webinar](https://github.com/fratilanico/webinar)

The webinar README covers:

```
┌─────────────────────────────────────────────────────┐
│                  WEBINAR SESSIONS                   │
├───────────────┬─────────────────────────────────────┤
│  Time         │  Topic                             │
├───────────────┼─────────────────────────────────────┤
│  00:00–05:00  │  Welcome + architecture overview   │
│  05:00–15:00  │  Project setup (Next.js + Supabase)│
│  15:00–30:00  │  Core CV Builder UI                │
│  30:00–50:00  │  Claude AI integration             │
│  50:00–60:00  │  Testing + deploy to Vercel        │
│  60:00–90:00  │  Q&A + architecture deep-dive      │
└───────────────┴─────────────────────────────────────┘
```

---

## ✨ Features

- Real-time split-pane editor + preview
- AI-powered section enhancement (Claude API)
- Dark / light mode (Supabase neon green aesthetic)
- Supabase auth + database with Row Level Security
- One-click deploy to Vercel
- Fully open source under MIT license

---

## 🏗️ Tech Stack

```
┌─────────────────────────────────────────────────────┐
│                    TECH STACK                       │
├───────────────────┬─────────────────────────────────┤
│  Layer            │  Technology                    │
├───────────────────┼─────────────────────────────────┤
│  Frontend         │  Next.js 14 App Router         │
│  UI Components    │  shadcn/ui + Tailwind CSS       │
│  Database         │  Supabase (Postgres)            │
│  Auth             │  Supabase Auth                  │
│  AI               │  Claude API (Anthropic)         │
│  Language         │  TypeScript 5                  │
│  Deployment       │  Vercel                         │
└───────────────────┴─────────────────────────────────┘
```

---

## 📄 License

MIT © [Nico Fratila](https://github.com/fratilanico)

See [LICENSE](LICENSE) for details.
