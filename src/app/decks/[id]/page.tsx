import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/button";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, PlayCircle } from "lucide-react";

type Params = { id: string };

const TYPE_COLORS: Record<string, string> = {
  definition:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
  concept:
    "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  comparison:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  cloze:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
};

export default async function DeckDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: deck }, { data: cards }] = await Promise.all([
    supabase.from("decks").select("id, title, created_at").eq("id", id).single(),
    supabase
      .from("cards")
      .select("id, type, question, answer, source_page")
      .eq("deck_id", id)
      .order("source_page", { ascending: true, nullsFirst: false }),
  ]);

  if (!deck) notFound();

  const rows = cards ?? [];

  return (
    <main className="relative mx-auto max-w-3xl px-6 py-14">
      <div className="pointer-events-none absolute right-0 top-0 -z-10 h-[220px] w-[220px] brand-blob opacity-40" />

      <Link
        href="/decks"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-200"
      >
        <ArrowLeft className="h-4 w-4" />
        All decks
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{deck.title}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {rows.length} cards · created {new Date(deck.created_at).toLocaleDateString()}
          </p>
        </div>
        <Link href={`/review?deck=${deck.id}`}>
          <Button className="h-11 px-5 shadow-lg shadow-indigo-500/20">
            <PlayCircle className="mr-2 h-4 w-4" />
            Start review
          </Button>
        </Link>
      </div>

      <ul className="mt-10 flex flex-col gap-3">
        {rows.map((c) => (
          <li
            key={c.id}
            className="rounded-xl border border-zinc-200 bg-white/80 p-5 shadow-sm backdrop-blur transition-colors hover:border-indigo-200 dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-indigo-800"
          >
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`rounded px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${
                  TYPE_COLORS[c.type] ?? TYPE_COLORS.concept
                }`}
              >
                {c.type}
              </span>
              {c.source_page !== null && (
                <span className="text-xs text-zinc-500">p. {c.source_page}</span>
              )}
            </div>
            <p className="font-medium">{c.question}</p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{c.answer}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
