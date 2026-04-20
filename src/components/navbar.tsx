import Link from "next/link";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-200/70 bg-white/60 backdrop-blur-lg dark:border-zinc-800/70 dark:bg-zinc-950/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold transition-opacity hover:opacity-80"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg brand-bg text-white shadow-md shadow-indigo-500/30">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="tracking-tight">Mnemo</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm text-zinc-600 dark:text-zinc-300">
          {user ? (
            <>
              <Link
                href="/decks"
                className="transition-colors hover:text-zinc-900 dark:hover:text-white"
              >
                Decks
              </Link>
              <Link
                href="/upload"
                className="transition-colors hover:text-zinc-900 dark:hover:text-white"
              >
                Upload
              </Link>
              <Link
                href="/review"
                className="transition-colors hover:text-zinc-900 dark:hover:text-white"
              >
                Review
              </Link>
              <form action="/auth/logout" method="post">
                <button
                  type="submit"
                  className="text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-white"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="transition-colors hover:text-zinc-900 dark:hover:text-white"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
