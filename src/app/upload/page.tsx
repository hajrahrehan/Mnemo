"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/button";

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setError("Choose a PDF first.");
    if (!title.trim()) return setError("Give your deck a title.");

    setError(null);
    setSubmitting(true);

    const body = new FormData();
    body.set("file", file);
    body.set("title", title.trim());

    const res = await fetch("/api/decks", { method: "POST", body });
    const json: { deck_id?: string; error?: string; detail?: string } =
      await res.json();

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

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Upload a PDF</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Pick a textbook chapter (PDF, up to 10&nbsp;MB). Mnemo will split it by
        passage and generate flashcards.
      </p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Deck title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Operating Systems — Chapter 3"
            className="h-10 rounded-md border border-zinc-200 bg-white px-3 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900"
            disabled={submitting}
          />
        </label>

        <div
          onClick={() => !submitting && inputRef.current?.click()}
          className="cursor-pointer rounded-xl border-2 border-dashed border-zinc-300 bg-white p-10 text-center transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
        >
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="h-6 w-6 text-indigo-600" />
              <div className="text-left">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-zinc-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB — click to change
                </p>
              </div>
            </div>
          ) : (
            <div>
              <Upload className="mx-auto h-10 w-10 text-zinc-400" />
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                Click to select a PDF
              </p>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setFile(f);
            }}
          />
        </div>

        <Button type="submit" disabled={submitting || !file} className="h-11 text-base">
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating cards…
            </>
          ) : (
            "Create deck"
          )}
        </Button>

        {error && (
          <p className="whitespace-pre-wrap rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
            {error}
          </p>
        )}
        {submitting && (
          <p className="text-xs text-zinc-500">
            This takes 10–30 seconds depending on PDF size. Hang tight.
          </p>
        )}
      </form>
    </main>
  );
}
