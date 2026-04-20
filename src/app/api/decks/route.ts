import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chunkPages, extractPagesFromPdf } from "@/lib/pdf";
import { generateFlashcards } from "@/lib/flashcards";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 10 * 1024 * 1024;  // 10 MB
const MAX_CHUNKS = 6;                 // cap LLM calls per upload for v1

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const title = (form.get("title") as string | null)?.trim();

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "file too large (max 10 MB)" }, { status: 413 });
  }
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "pdf files only" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // 1. Insert the deck row first so we get an ID to use in the storage path.
  const { data: deck, error: deckErr } = await supabase
    .from("decks")
    .insert({ user_id: user.id, title })
    .select("id")
    .single();
  if (deckErr || !deck) {
    console.error("deck insert", deckErr);
    return NextResponse.json({ error: "failed to create deck" }, { status: 500 });
  }

  // 2. Upload PDF to the user's folder in the 'pdfs' bucket.
  const storagePath = `${user.id}/${deck.id}.pdf`;
  const { error: uploadErr } = await supabase.storage
    .from("pdfs")
    .upload(storagePath, buffer, {
      contentType: "application/pdf",
      upsert: false,
    });
  if (uploadErr) {
    console.error("upload", uploadErr);
    await supabase.from("decks").delete().eq("id", deck.id);
    return NextResponse.json({ error: "failed to store pdf" }, { status: 500 });
  }
  await supabase.from("decks").update({ source_pdf_path: storagePath }).eq("id", deck.id);

  // 3. Extract text per page and chunk into passages.
  let pages;
  try {
    pages = await extractPagesFromPdf(buffer);
  } catch (e) {
    console.error("pdf parse", e);
    return NextResponse.json(
      { error: "could not read pdf", deck_id: deck.id },
      { status: 422 },
    );
  }
  const chunks = chunkPages(pages).slice(0, MAX_CHUNKS);

  // 4. Generate flashcards for each chunk in parallel.
  const cardLists = await Promise.all(
    chunks.map((c) =>
      generateFlashcards({ passage: c.text, sourcePage: c.startPage }).catch((e) => {
        console.error("flashcard gen", e);
        return [];
      }),
    ),
  );
  const cards = cardLists.flat();

  if (cards.length === 0) {
    return NextResponse.json(
      {
        error: "no flashcards generated — pdf may be scanned/images only",
        deck_id: deck.id,
      },
      { status: 422 },
    );
  }

  // 5. Insert cards.
  const { error: cardErr } = await supabase.from("cards").insert(
    cards.map((c) => ({
      deck_id: deck.id,
      type: c.type,
      question: c.question,
      answer: c.answer,
      source_page: c.source_page ?? null,
    })),
  );
  if (cardErr) {
    console.error("cards insert", cardErr);
    return NextResponse.json({ error: "failed to save cards" }, { status: 500 });
  }

  return NextResponse.json({ deck_id: deck.id, card_count: cards.length });
}
