import { Button } from "@/components/button";
import { Upload } from "lucide-react";

export default function UploadPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Upload a PDF</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Pick a textbook chapter (PDF, up to 50&nbsp;MB). Mnemo will split it by
        section and generate flashcards.
      </p>

      <div className="mt-8 rounded-xl border-2 border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
        <Upload className="mx-auto h-10 w-10 text-zinc-400" />
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          Drag &amp; drop your PDF here, or
        </p>
        <Button className="mt-4" disabled>
          Choose file (coming in Day 2)
        </Button>
      </div>

      <p className="mt-6 text-xs text-zinc-500">
        Uploader wiring lands in the next step — this page is the drop-zone
        stub. Library functions in <code>src/lib/pdf.ts</code> and{" "}
        <code>src/lib/flashcards.ts</code> are already live.
      </p>
    </main>
  );
}
