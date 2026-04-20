"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/button";
import { Loader2 } from "lucide-react";

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

  async function rate(quality: number) {
    if (!card) return;
    setSubmitting(true);
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
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-semibold">All done 🎉</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {reviewed > 0
            ? `You reviewed ${reviewed} ${reviewed === 1 ? "card" : "cards"}. Come back later — SM-2 will surface more when they're due.`
            : "No cards due right now. Upload a PDF or wait for scheduled cards to come back around."}
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/decks">
            <Button variant="secondary">Back to decks</Button>
          </Link>
          <Link href="/upload">
            <Button>Upload a PDF</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-6 flex items-center justify-between text-xs text-zinc-500">
        <span>{remaining} due</span>
        <span>{reviewed} reviewed this session</span>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {card.type}
          </span>
          {card.source_page !== null && (
            <span className="text-xs text-zinc-500">p. {card.source_page}</span>
          )}
        </div>
        <p className="text-lg font-medium leading-snug">{card.question}</p>

        {revealed && (
          <div className="mt-6 border-t border-zinc-200 pt-6 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
            {card.answer}
          </div>
        )}
      </div>

      <div className="mt-6">
        {!revealed ? (
          <Button onClick={() => setRevealed(true)} className="w-full h-11 text-base">
            Show answer
          </Button>
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
    red: "border-red-200 hover:bg-red-50 text-red-700 dark:border-red-900 dark:hover:bg-red-950 dark:text-red-200",
    amber: "border-amber-200 hover:bg-amber-50 text-amber-700 dark:border-amber-900 dark:hover:bg-amber-950 dark:text-amber-200",
    green: "border-green-200 hover:bg-green-50 text-green-700 dark:border-green-900 dark:hover:bg-green-950 dark:text-green-200",
    indigo: "border-indigo-200 hover:bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:hover:bg-indigo-950 dark:text-indigo-200",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-14 flex-col items-center justify-center rounded-md border bg-white text-sm font-medium transition-colors disabled:opacity-50 dark:bg-zinc-900 ${tones[tone]}`}
    >
      <span>{label}</span>
      <span className="text-xs font-normal opacity-70">{hint}</span>
    </button>
  );
}

export default function ReviewPage() {
  return (
    <Suspense>
      <ReviewSession />
    </Suspense>
  );
}
