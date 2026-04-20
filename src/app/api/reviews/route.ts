import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  initialSM2State,
  nextReviewDate,
  reviewCard,
  type Quality,
} from "@/lib/sm2";

const Body = z.object({
  card_id: z.string().uuid(),
  quality: z.number().int().min(0).max(5),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = Body.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const { card_id, quality } = parsed.data;

  // Load the most recent SM-2 state for this card (if any).
  const { data: prev } = await supabase
    .from("reviews")
    .select("ease_factor, interval_days, repetitions")
    .eq("user_id", user.id)
    .eq("card_id", card_id)
    .order("reviewed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const prevState = prev
    ? {
        easeFactor: prev.ease_factor,
        interval: prev.interval_days,
        repetitions: prev.repetitions,
      }
    : initialSM2State;

  const next = reviewCard(prevState, quality as Quality);
  const nextAt = nextReviewDate(next.interval);

  const { error: insertErr } = await supabase.from("reviews").insert({
    user_id: user.id,
    card_id,
    quality,
    ease_factor: next.easeFactor,
    interval_days: next.interval,
    repetitions: next.repetitions,
    next_review_at: nextAt.toISOString(),
  });
  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({
    ease_factor: next.easeFactor,
    interval_days: next.interval,
    next_review_at: nextAt.toISOString(),
  });
}
