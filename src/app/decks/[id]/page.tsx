import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/button";
import { createClient } from "@/lib/supabase/server";

type Params = { id: string };

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
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/decks"
        className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
      >
        ← All decks
      </Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{deck.title}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {rows.length} cards · created {new Date(deck.created_at).toLocaleDateString()}
          </p>
        </div>
        <Link href={`/review?deck=${deck.id}`}>
          <Button className="h-10">Start review</Button>
        </Link>
      </div>

      <ul className="mt-10 flex flex-col gap-3">
        {rows.map((c) => (
          <li
            key={c.id}
            className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
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
