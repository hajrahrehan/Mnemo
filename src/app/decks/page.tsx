import Link from "next/link";
import { Button } from "@/components/button";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/stat-card";
import { loadDeckStats } from "@/lib/stats";
import { BookOpen, CalendarClock, FileText, Flame, Plus, Sparkles } from "lucide-react";

export default async function DecksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: decks }, stats] = await Promise.all([
    supabase
      .from("decks")
      .select("id, title, created_at, cards(count)")
      .order("created_at", { ascending: false }),
    user
      ? loadDeckStats(supabase, user.id)
      : Promise.resolve({ totalDecks: 0, totalCards: 0, dueToday: 0, reviewsTotal: 0, streakDays: 0 }),
  ]);

  type DeckRow = {
    id: string;
    title: string;
    created_at: string;
    cards: { count: number }[];
  };
  const rows = (decks ?? []) as DeckRow[];

  return (
    <main className="relative mx-auto max-w-5xl px-6 py-14">
      <div className="pointer-events-none absolute left-1/3 top-0 -z-10 h-[260px] w-[260px] brand-blob opacity-40" />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Your decks</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Each PDF you upload becomes a deck. Review them daily.
          </p>
        </div>
        <div className="flex gap-2">
          {stats.dueToday > 0 && (
            <Link href="/review">
              <Button variant="secondary" className="h-10">
                Review {stats.dueToday}
              </Button>
            </Link>
          )}
          <Link href="/upload">
            <Button className="h-10 shadow-lg shadow-indigo-500/20">
              <Plus className="mr-1 h-4 w-4" />
              New deck
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Due today"
          value={stats.dueToday}
          icon={<CalendarClock className="h-5 w-5" />}
          accent="brand"
        />
        <StatCard
          label="Streak"
          value={`${stats.streakDays} ${stats.streakDays === 1 ? "day" : "days"}`}
          icon={<Flame className="h-5 w-5" />}
          accent="amber"
        />
        <StatCard
          label="Cards"
          value={stats.totalCards}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          label="Reviews"
          value={stats.reviewsTotal}
          icon={<Sparkles className="h-5 w-5" />}
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="mt-10 grid gap-3 sm:grid-cols-2">
          {rows.map((d) => (
            <li key={d.id}>
              <Link
                href={`/decks/${d.id}`}
                className="group flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white/80 p-5 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-indigo-700"
              >
                <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 transition-colors group-hover:brand-bg group-hover:text-white dark:bg-indigo-950/60 dark:text-indigo-300">
                  <BookOpen className="h-5 w-5" />
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

function EmptyState() {
  return (
    <div className="relative mt-10 overflow-hidden rounded-2xl border border-dashed border-zinc-300 bg-white/70 p-14 text-center backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/60">
      <div className="pointer-events-none absolute inset-x-0 -top-20 h-40 brand-blob opacity-60" />
      <div className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl brand-bg text-white shadow-lg shadow-indigo-500/25">
        <Sparkles className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No decks yet</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500">
        Upload a PDF to create your first deck. Mnemo will generate cards you can
        start reviewing in under a minute.
      </p>
      <Link href="/upload" className="mt-5 inline-block">
        <Button className="h-10">Upload your first PDF</Button>
      </Link>
    </div>
  );
}
