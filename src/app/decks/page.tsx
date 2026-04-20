import Link from "next/link";
import { Button } from "@/components/button";

export default function DecksPage() {
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

      <div className="mt-10 rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="font-medium">No decks yet</h3>
        <p className="mt-2 text-sm text-zinc-500">
          Upload a PDF to create your first deck.
        </p>
      </div>
    </main>
  );
}
