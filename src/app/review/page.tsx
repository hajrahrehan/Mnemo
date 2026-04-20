export default function ReviewPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Review</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Your daily review queue. Cards due today, scheduled by SM-2.
      </p>

      <div className="mt-10 rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="font-medium">Nothing due yet</h3>
        <p className="mt-2 text-sm text-zinc-500">
          Create a deck to start reviewing.
        </p>
      </div>
    </main>
  );
}
