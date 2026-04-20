"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Button } from "@/components/button";
import { Flame, Loader2, PartyPopper, Sparkles } from "lucide-react";

type Card = {
  id: string;
  type: string;
  question: string;
  answer: string;
  source_page: number | null;
};

function ReviewSession() {
  const search = useSearchParams();
  const deckId = search.get("deck");

  const [card, setCard] = useState<Card | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [celebrated, setCelebrated] = useState(false);
  const prevCardIdRef = useRef<string | null>(null);

  const fetchNext = useCallback(async () => {
    setLoading(true);
    setRevealed(false);
    const qs = deckId ? `?deck=${deckId}` : "";
    const res = await fetch(`/api/reviews/next${qs}`);
    const json: { card: Card | null; remaining: number } = await res.json();
    setCard(json.card);
    setRemaining(json.remaining);
    setLoading(false);
  }, [deckId]);

  useEffect(() => {
    fetchNext();
  }, [fetchNext]);

  useEffect(() => {
    // Fire confetti once when the queue runs dry after reviewing cards.
    if (!loading && !card && reviewed > 0 && !celebrated) {
      setCelebrated(true);
      burstConfetti();
    }
  }, [loading, card, reviewed, celebrated]);

  async function rate(quality: number) {
    if (!card) return;
    setSubmitting(true);
    prevCardIdRef.current = card.id;
    await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ card_id: card.id, quality }),
    });
    setReviewed((n) => n + 1);
    setSubmitting(false);
    fetchNext();
  }

  if (loading) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </main>
    );
  }

  if (!card) {
    return (
      <main className="relative mx-auto max-w-2xl px-6 py-20 text-center">
        <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[300px] w-[300px] -translate-x-1/2 brand-blob opacity-50" />
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 18 }}
          className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl brand-bg text-white shadow-lg shadow-indigo-500/30"
        >
          {reviewed > 0 ? (
            <PartyPopper className="h-8 w-8" />
          ) : (
            <Sparkles className="h-8 w-8" />
          )}
        </motion.div>
        <h1 className="text-3xl font-semibold">
          {reviewed > 0 ? "All caught up!" : "Nothing due right now"}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-zinc-600 dark:text-zinc-400">
          {reviewed > 0
            ? `You reviewed ${reviewed} ${reviewed === 1 ? "card" : "cards"}. SM-2 will bring more around when they're due.`
            : "Upload a PDF or come back later — scheduled cards will reappear automatically."}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/decks">
            <Button variant="secondary" className="h-11 px-6">
              Back to decks
            </Button>
          </Link>
          <Link href="/upload">
            <Button className="h-11 px-6">Upload a PDF</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative mx-auto max-w-2xl px-6 py-14">
      {/* Session header */}
      <div className="mb-6 flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
          {remaining} due
        </span>
        {reviewed > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <Flame className="h-3 w-3" />
            {reviewed} reviewed
          </span>
        )}
      </div>

      {/* Flippable card */}
      <div className="perspective">
        <AnimatePresence mode="wait">
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              animate={{ rotateY: revealed ? 180 : 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="preserve-3d relative h-[340px] w-full"
            >
              {/* Front (question) */}
              <div className="backface-hidden absolute inset-0 flex flex-col rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <CardMeta type={card.type} page={card.source_page} />
                <div className="mt-4 flex flex-1 items-center">
                  <p className="w-full text-center text-xl font-medium leading-snug">
                    {card.question}
                  </p>
                </div>
                <p className="mt-4 text-center text-xs text-zinc-400">Tap to reveal</p>
              </div>
              {/* Back (answer) */}
              <div className="flip-y backface-hidden absolute inset-0 flex flex-col rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-8 shadow-sm dark:border-indigo-900 dark:from-indigo-950/40 dark:to-zinc-900">
                <CardMeta type={card.type} page={card.source_page} />
                <div className="mt-4 flex flex-1 items-center">
                  <p className="w-full text-center text-lg leading-relaxed text-zinc-800 dark:text-zinc-200">
                    {card.answer}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="mt-6">
        {!revealed ? (
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setRevealed(true)}
            className="inline-flex h-12 w-full items-center justify-center rounded-xl brand-bg text-base font-medium text-white shadow-lg shadow-indigo-500/25"
          >
            Show answer
          </motion.button>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            <RateButton label="Again" hint="<1 min" onClick={() => rate(1)} disabled={submitting} tone="red" />
            <RateButton label="Hard" hint="short" onClick={() => rate(3)} disabled={submitting} tone="amber" />
            <RateButton label="Good" hint="normal" onClick={() => rate(4)} disabled={submitting} tone="green" />
            <RateButton label="Easy" hint="long" onClick={() => rate(5)} disabled={submitting} tone="indigo" />
          </div>
        )}
      </div>
    </main>
  );
}

function CardMeta({ type, page }: { type: string; page: number | null }) {
  return (
    <div className="flex items-center gap-2">
      <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
        {type}
      </span>
      {page !== null && (
        <span className="text-xs text-zinc-500">p. {page}</span>
      )}
    </div>
  );
}

function RateButton({
  label,
  hint,
  onClick,
  disabled,
  tone,
}: {
  label: string;
  hint: string;
  onClick: () => void;
  disabled?: boolean;
  tone: "red" | "amber" | "green" | "indigo";
}) {
  const tones: Record<typeof tone, string> = {
    red: "border-red-200 hover:bg-red-50 text-red-700 dark:border-red-900 dark:hover:bg-red-950/40 dark:text-red-300",
    amber: "border-amber-200 hover:bg-amber-50 text-amber-700 dark:border-amber-900 dark:hover:bg-amber-950/40 dark:text-amber-300",
    green: "border-green-200 hover:bg-green-50 text-green-700 dark:border-green-900 dark:hover:bg-green-950/40 dark:text-green-300",
    indigo: "border-indigo-200 hover:bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:hover:bg-indigo-950/40 dark:text-indigo-300",
  };
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-16 flex-col items-center justify-center rounded-xl border bg-white text-sm font-medium shadow-sm transition-colors disabled:opacity-50 dark:bg-zinc-900 ${tones[tone]}`}
    >
      <span>{label}</span>
      <span className="text-xs font-normal opacity-70">{hint}</span>
    </motion.button>
  );
}

function burstConfetti() {
  const duration = 1500;
  const end = Date.now() + duration;
  const colors = ["#6366f1", "#a855f7", "#f59e0b", "#10b981"];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export default function ReviewPage() {
  return (
    <Suspense>
      <ReviewSession />
    </Suspense>
  );
}
