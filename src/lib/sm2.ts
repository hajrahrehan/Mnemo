/**
 * SuperMemo SM-2 spaced-repetition algorithm.
 * Reference: https://super-memory.com/english/ol/sm2.htm
 *
 * Quality scale (matches the 4-button Anki UX):
 *   0 = Again      (total blackout)
 *   1 = Again      (wrong, but felt familiar)
 *   2 = Hard       (wrong, remembered after seeing answer)
 *   3 = Good       (correct, some effort)
 *   4 = Easy       (correct, little effort)
 *   5 = Easy       (perfect recall)
 */

export type Quality = 0 | 1 | 2 | 3 | 4 | 5;

export interface SM2State {
  easeFactor: number;   // difficulty multiplier, min 1.3
  interval: number;     // days until next review
  repetitions: number;  // consecutive successful recalls
}

export const initialSM2State: SM2State = {
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0,
};

export function reviewCard(state: SM2State, quality: Quality): SM2State {
  // Failure resets the learning streak but preserves ease.
  if (quality < 3) {
    return {
      easeFactor: state.easeFactor,
      interval: 1,
      repetitions: 0,
    };
  }

  const repetitions = state.repetitions + 1;

  let interval: number;
  if (repetitions === 1) interval = 1;
  else if (repetitions === 2) interval = 6;
  else interval = Math.round(state.interval * state.easeFactor);

  // Ease adjustment from the original SM-2 paper.
  const easeFactor = Math.max(
    1.3,
    state.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );

  return { easeFactor, interval, repetitions };
}

export function nextReviewDate(intervalDays: number, from: Date = new Date()): Date {
  const next = new Date(from);
  next.setDate(next.getDate() + intervalDays);
  return next;
}
