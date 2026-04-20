import type { SupabaseClient } from "@supabase/supabase-js";

export interface DeckStats {
  totalDecks: number;
  totalCards: number;
  dueToday: number;
  reviewsTotal: number;
  streakDays: number;
}

function sameYMD(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Compute the current consecutive-day review streak ending at today/yesterday. */
function computeStreak(reviewedAtIso: string[]): number {
  if (reviewedAtIso.length === 0) return 0;

  const days = new Set(
    reviewedAtIso.map((iso) => {
      const d = new Date(iso);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    }),
  );

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  const yesterdayKey = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;

  // Streak must include today or yesterday to be "alive".
  let cursor: Date;
  if (days.has(todayKey)) cursor = today;
  else if (days.has(yesterdayKey)) cursor = yesterday;
  else return 0;

  let streak = 0;
  while (true) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
    if (!days.has(key)) break;
    streak += 1;
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export async function loadDeckStats(
  supabase: SupabaseClient,
  userId: string,
): Promise<DeckStats> {
  const [{ count: totalDecks }, { count: totalCards }, { data: reviews }] = await Promise.all([
    supabase.from("decks").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("cards").select("id", { count: "exact", head: true }),
    supabase
      .from("reviews")
      .select("card_id, next_review_at, reviewed_at")
      .eq("user_id", userId)
      .order("reviewed_at", { ascending: false }),
  ]);

  // Cards never reviewed count as due (new cards).
  const { count: totalCardsExact } = await supabase
    .from("cards")
    .select("id", { count: "exact", head: true });

  const latestByCard = new Map<string, Date>();
  const reviewedAt: string[] = [];
  for (const r of reviews ?? []) {
    reviewedAt.push(r.reviewed_at);
    if (!latestByCard.has(r.card_id)) {
      latestByCard.set(r.card_id, new Date(r.next_review_at));
    }
  }

  const now = new Date();
  const reviewedCardIds = latestByCard.size;
  const reviewedDue = Array.from(latestByCard.values()).filter((d) => d <= now).length;
  const neverReviewed = (totalCardsExact ?? 0) - reviewedCardIds;
  const dueToday = reviewedDue + Math.max(0, neverReviewed);

  return {
    totalDecks: totalDecks ?? 0,
    totalCards: totalCards ?? 0,
    dueToday,
    reviewsTotal: reviews?.length ?? 0,
    streakDays: computeStreak(reviewedAt),
  };
}
