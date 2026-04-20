"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/button";
import { Brain, FileText, Sparkles, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="relative mx-auto max-w-5xl px-6 py-20">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute left-1/2 top-20 -z-10 h-[420px] w-[420px] -translate-x-1/2 brand-blob opacity-60" />
      <div className="pointer-events-none absolute right-0 top-40 -z-10 h-[240px] w-[240px] brand-blob opacity-40" />

      <section className="flex flex-col items-center text-center">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-xs text-zinc-700 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300"
        >
          <Sparkles className="h-3 w-3 text-indigo-500" /> Powered by Groq · Llama 3.3 · Supabase
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl"
        >
          Turn any PDF into{" "}
          <span className="brand-text">flashcards</span>
          <br />
          you&apos;ll actually remember.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mt-6 max-w-xl text-lg text-zinc-600 dark:text-zinc-400"
        >
          Upload a textbook chapter, and Mnemo generates study cards with AI —
          then schedules them using the same spaced-repetition algorithm Anki uses.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link href="/upload">
            <Button className="h-12 px-7 text-base shadow-lg shadow-indigo-500/20 transition-transform hover:-translate-y-0.5">
              Upload a PDF
            </Button>
          </Link>
          <Link href="/decks">
            <Button variant="secondary" className="h-12 px-7 text-base transition-transform hover:-translate-y-0.5">
              See your decks
            </Button>
          </Link>
        </motion.div>
      </section>

      <section className="relative mt-28 grid gap-4 sm:grid-cols-3">
        <Feature
          delay={0}
          icon={<FileText className="h-5 w-5" />}
          title="PDF in, cards out"
          body="Upload a chapter and Mnemo splits it into passages, then generates a mix of definition, concept and cloze cards."
        />
        <Feature
          delay={0.08}
          icon={<Brain className="h-5 w-5" />}
          title="SM-2 spaced repetition"
          body="Cards you struggle with come back sooner; cards you know drift further out. The same algorithm Anki uses."
        />
        <Feature
          delay={0.16}
          icon={<Zap className="h-5 w-5" />}
          title="Fast LLM"
          body="Llama 3.3 via Groq processes a 50-page chapter in seconds. Free on your own API key."
        />
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  body,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -3 }}
      className="group rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur transition-colors hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-indigo-700"
    >
      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md brand-bg text-white shadow-md shadow-indigo-500/20">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{body}</p>
    </motion.div>
  );
}
