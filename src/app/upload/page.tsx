"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, FileText, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/button";

const FUN_STATUS = [
  "Reading your PDF…",
  "Splitting it into passages…",
  "Calling Llama 3.3 on Groq…",
  "Generating definition + cloze cards…",
  "Almost there, writing to your deck…",
];

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusIdx, setStatusIdx] = useState(0);
  const [dragging, setDragging] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setError("Choose a PDF first.");
    if (!title.trim()) return setError("Give your deck a title.");

    setError(null);
    setSubmitting(true);
    setStatusIdx(0);

    // Cycle status messages while the request is in flight.
    const interval = setInterval(() => {
      setStatusIdx((i) => Math.min(i + 1, FUN_STATUS.length - 1));
    }, 3500);

    const body = new FormData();
    body.set("file", file);
    body.set("title", title.trim());

    const res = await fetch("/api/decks", { method: "POST", body });
    const json: { deck_id?: string; error?: string; detail?: string } =
      await res.json();
    clearInterval(interval);

    if (!res.ok) {
      setSubmitting(false);
      setError(
        json.detail
          ? `${json.error ?? "upload failed"}\n\nParser detail: ${json.detail}`
          : json.error ?? "upload failed",
      );
      return;
    }

    router.push(`/decks/${json.deck_id}`);
    router.refresh();
  }

  function onFileSelected(f: File | undefined) {
    if (!f) return;
    setFile(f);
    if (!title) {
      // Suggest a title from the filename.
      setTitle(
        f.name
          .replace(/\.pdf$/i, "")
          .replace(/[_\-.]+/g, " ")
          .replace(/\s+/g, " ")
          .trim(),
      );
    }
  }

  return (
    <main className="relative mx-auto max-w-2xl px-6 py-14">
      <div className="pointer-events-none absolute right-0 top-10 -z-10 h-[220px] w-[220px] brand-blob opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-semibold">Upload a PDF</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Pick a textbook chapter (PDF, up to 4&nbsp;MB). Mnemo will split it by
          passage and generate flashcards.
        </p>
      </motion.div>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Deck title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Operating Systems — Chapter 3"
            className="h-11 rounded-lg border border-zinc-200 bg-white px-3 outline-none transition-colors focus:border-indigo-400 dark:border-zinc-800 dark:bg-zinc-900"
            disabled={submitting}
          />
        </label>

        <motion.div
          onClick={() => !submitting && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            if (!submitting) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files?.[0];
            onFileSelected(f);
          }}
          animate={{
            borderColor: dragging ? "rgb(99 102 241)" : undefined,
            backgroundColor: dragging ? "rgb(238 242 255 / 0.6)" : undefined,
          }}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
            file
              ? "border-indigo-300 bg-indigo-50/40 dark:border-indigo-800 dark:bg-indigo-950/20"
              : "border-zinc-300 bg-white/80 hover:border-indigo-300 dark:border-zinc-700 dark:bg-zinc-900/60"
          }`}
        >
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <div className="rounded-lg brand-bg p-2 text-white">
                <FileText className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-zinc-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB — click to change
                </p>
              </div>
            </div>
          ) : (
            <div>
              <motion.div
                animate={dragging ? { y: -4 } : { y: 0 }}
                className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl brand-bg text-white shadow-lg shadow-indigo-500/25"
              >
                <Upload className="h-6 w-6" />
              </motion.div>
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                Click to select a PDF, or drag &amp; drop it here
              </p>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => onFileSelected(e.target.files?.[0] ?? undefined)}
          />
        </motion.div>

        <Button
          type="submit"
          disabled={submitting || !file}
          className="h-12 text-base shadow-lg shadow-indigo-500/20"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {FUN_STATUS[statusIdx]}
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Create deck
            </>
          )}
        </Button>

        {error && (
          <p className="whitespace-pre-wrap rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
            {error}
          </p>
        )}
      </form>
    </main>
  );
}
