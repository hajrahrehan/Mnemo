import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Returns the next card due for review.
 *
 * Selection rules:
 *   1. Cards the user has never reviewed come first (never-seen cards).
 *   2. Then cards whose most-recent review's next_review_at <= now.
 *   3. Optional ?deck=<id> scopes the queue to a single deck.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const deckId = url.searchParams.get("deck");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Pull the user's cards (RLS filters to decks they own).
  let cardsQ = supabase.from("cards").select("id, type, question, answer, source_page, deck_id");
  if (deckId) cardsQ = cardsQ.eq("deck_id", deckId);
  const { data: cards, error: cardsErr } = await cardsQ;
  if (cardsErr) {
    return NextResponse.json({ error: cardsErr.message }, { status: 500 });
  }
  if (!cards || cards.length === 0) {
    return NextResponse.json({ card: null, remaining: 0 });
  }

  const cardIds = cards.map((c) => c.id);

  // Latest review per card, in one round-trip.
  const { data: reviews } = await supabase
    .from("reviews")
    .select("card_id, next_review_at, reviewed_at")
    .eq("user_id", user.id)
    .in("card_id", cardIds)
    .order("reviewed_at", { ascending: false });

  const latestByCard = new Map<string, { next_review_at: string }>();
  for (const r of reviews ?? []) {
    if (!latestByCard.has(r.card_id)) {
      latestByCard.set(r.card_id, { next_review_at: r.next_review_at });
    }
  }

  const now = Date.now();
  const due = cards.filter((c) => {
    const latest = latestByCard.get(c.id);
    return !latest || new Date(latest.next_review_at).getTime() <= now;
  });

  const next = due.find((c) => !latestByCard.has(c.id)) ?? due[0] ?? null;
  return NextResponse.json({ card: next, remaining: due.length });
}
