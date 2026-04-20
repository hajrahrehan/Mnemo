import Link from "next/link";
import { BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-200/70 bg-white/70 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/70">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <BookOpen className="h-5 w-5" />
          <span>Mnemo</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-zinc-600 dark:text-zinc-300">
          {user ? (
            <>
              <Link href="/decks" className="hover:text-zinc-900 dark:hover:text-white">
                Decks
              </Link>
              <Link href="/upload" className="hover:text-zinc-900 dark:hover:text-white">
                Upload
              </Link>
              <Link href="/review" className="hover:text-zinc-900 dark:hover:text-white">
                Review
              </Link>
              <form action="/auth/logout" method="post">
                <button
                  type="submit"
                  className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <Link href="/auth/login" className="hover:text-zinc-900 dark:hover:text-white">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
