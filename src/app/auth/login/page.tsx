"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/button";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? "/decks";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    const supabase = createClient();
    const fn =
      mode === "login"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });
    const { data, error: authError } = await fn;

    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }

    if (mode === "signup" && !data.session) {
      setNotice(
        "Check your email for a confirmation link — or disable email confirmation in your Supabase project to log in immediately.",
      );
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <main className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-sm flex-col justify-center px-6 py-16">
      <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[280px] w-[280px] -translate-x-1/2 brand-blob opacity-60" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl brand-bg text-white shadow-lg shadow-indigo-500/30">
          <Sparkles className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {mode === "login"
            ? "Log in to access your decks."
            : "Sign up to start turning PDFs into flashcards."}
        </p>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="mt-6 flex flex-col gap-3"
      >
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition-colors focus:border-indigo-400 dark:border-zinc-800 dark:bg-zinc-900"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition-colors focus:border-indigo-400 dark:border-zinc-800 dark:bg-zinc-900"
        />
        <Button
          type="submit"
          disabled={loading}
          className="h-11 shadow-lg shadow-indigo-500/20"
        >
          {loading ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
        </Button>
        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
            {error}
          </p>
        )}
        {notice && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            {notice}
          </p>
        )}
      </motion.form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "login" ? "signup" : "login");
          setError(null);
          setNotice(null);
        }}
        className="mt-6 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-200"
      >
        {mode === "login"
          ? "Need an account? Sign up"
          : "Already have an account? Log in"}
      </button>

      <Link
        href="/"
        className="mt-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-200"
      >
        ← Back to home
      </Link>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
