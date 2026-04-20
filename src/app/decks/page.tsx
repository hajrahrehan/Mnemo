import Link from "next/link";
import { Button } from "@/components/button";
import { createClient } from "@/lib/supabase/server";
import { FileText } from "lucide-react";

export default async function DecksPage() {
  const supabase = await createClient();
  const { data: decks } = await supabase
    .from("decks")
    .select("id, title, created_at, cards(count)")
    .order("created_at", { ascending: false });

  type DeckRow = {
    id: string;
    title: string;
    created_at: string;
    cards: { count: number }[];
  };
  const rows = (decks ?? []) as DeckRow[];

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Your decks</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Each PDF you upload becomes a deck. Review them daily.
          </p>
        </div>
        <Link href="/upload">
          <Button>New deck</Button>
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <h3 className="font-medium">No decks yet</h3>
          <p className="mt-2 text-sm text-zinc-500">
            Upload a PDF to create your first deck.
          </p>
        </div>
      ) : (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {rows.map((d) => (
            <li key={d.id}>
              <Link
                href={`/decks/${d.id}`}
                className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
              >
                <div className="rounded-md bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{d.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {d.cards[0]?.count ?? 0} cards ·{" "}
                    {new Date(d.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
