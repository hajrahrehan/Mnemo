import Link from "next/link";
import { Button } from "@/components/button";
import { Brain, FileText, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <section className="flex flex-col items-center text-center">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          <Zap className="h-3 w-3" /> Built with Groq · Llama 3.3 · Supabase
        </span>
        <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
          Turn any PDF into <span className="text-indigo-600 dark:text-indigo-400">flashcards</span> you&apos;ll actually remember.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          Upload a textbook chapter, and Mnemo generates study cards with AI —
          then schedules them using the same spaced-repetition algorithm Anki uses.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/upload">
            <Button className="h-11 px-6 text-base">Upload a PDF</Button>
          </Link>
          <Link href="/decks">
            <Button variant="secondary" className="h-11 px-6 text-base">
              See your decks
            </Button>
          </Link>
        </div>
      </section>

      <section className="mt-24 grid gap-6 sm:grid-cols-3">
        <Feature
          icon={<FileText className="h-5 w-5" />}
          title="PDF in, cards out"
          body="Upload a chapter and Mnemo splits it into passages, then generates a mix of definition, concept and cloze cards."
        />
        <Feature
          icon={<Brain className="h-5 w-5" />}
          title="SM-2 spaced repetition"
          body="Cards you struggle with come back sooner; cards you know drift further out. No guesswork — just the algorithm Anki uses."
        />
        <Feature
          icon={<Zap className="h-5 w-5" />}
          title="Fast LLM"
          body="Llama 3.3 via Groq processes a 50-page chapter in seconds. Free to run on your own API key."
        />
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{body}</p>
    </div>
  );
}
