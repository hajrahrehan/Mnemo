# Mnemo

> Turn any PDF textbook into AI-generated flashcards — and never forget what you studied.

Mnemo is an AI-powered study tool that converts textbook PDFs into flashcards
and schedules them using the **SM-2 spaced-repetition algorithm** — the same
algorithm Anki uses. Upload a chapter, pick the sections you care about, and
Mnemo generates a mix of definition, concept, comparison and cloze-deletion
cards with page references. Review them daily, and Mnemo adapts the schedule
to your memory.

Built with **Next.js**, **Supabase**, and **Groq's Llama 3.3** for fast,
structured flashcard generation.

## Features

- 📄 **PDF → cards** — upload a chapter, get a deck of high-quality flashcards
- 🧠 **SM-2 spaced repetition** — the same algorithm Anki uses
- ⚡ **Fast LLM inference** — Groq runs Llama 3.3 70B at 500+ tokens/sec
- 🔧 **Structured output via tool-use** — no fragile JSON parsing
- 🔐 **Auth + storage** — Supabase handles users, PDFs and the database

## Tech stack

| Layer | Tech |
| --- | --- |
| Frontend | Next.js 16 (App Router, RSC), Tailwind v4, lucide-react |
| Backend | Next.js Route Handlers |
| LLM | Groq (`llama-3.3-70b-versatile`) via the OpenAI SDK |
| PDF parsing | `pdf-parse` |
| Database / Auth / Storage | Supabase (Postgres + RLS) |
| Validation | Zod |

## Getting started

### 1. Clone & install

```bash
git clone https://github.com/hajrahrehan/Mnemo.git
cd Mnemo
npm install
```

### 2. Create a Groq API key

1. Sign up at [console.groq.com](https://console.groq.com) (free, no credit card).
2. Create an API key.
3. Copy it — you'll paste it in `.env.local` next.

### 3. Create a Supabase project

1. Sign up at [supabase.com](https://supabase.com) → create a new project.
2. Settings → API → copy the project URL and the `anon` key.
3. (Later) Settings → API → copy the `service_role` key for server-side routes.

### 4. Configure environment

```bash
cp .env.example .env.local
```

Fill in the values you just collected. Do **not** commit `.env.local`.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout with navbar
│   ├── page.tsx             # Landing page
│   ├── upload/              # PDF upload flow
│   ├── decks/               # Deck list
│   └── review/              # Daily review session
├── components/
│   ├── navbar.tsx
│   └── button.tsx
└── lib/
    ├── groq.ts              # LLM client (OpenAI SDK → Groq)
    ├── flashcards.ts        # Prompt + tool schema + generator
    ├── pdf.ts               # PDF parsing + chunking
    ├── sm2.ts               # SuperMemo SM-2 algorithm
    ├── utils.ts             # cn() helper
    └── supabase/
        ├── client.ts        # Browser client
        └── server.ts        # Server-side client (cookies)
```

## Roadmap

**v1 (MVP):**
- [x] Next.js app with landing, upload, decks, review routes
- [x] SM-2 algorithm + Groq flashcard generator
- [ ] PDF upload → Supabase Storage → passage extraction
- [ ] Deck creation from a PDF
- [ ] Review session UI (card flip + Again/Hard/Good/Easy)
- [ ] Daily due-cards queue

**v2:**
- [ ] Export decks to Anki `.apkg`
- [ ] Image cards (diagrams from PDFs + vision model)
- [ ] Near-duplicate detection via embeddings
- [ ] Multi-user deck sharing

## License

MIT — do whatever you want, but attribution is appreciated.
