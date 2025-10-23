import { Card } from "../types";

const SM2_CONSTANTS = {
  INITIAL_INTERVAL: 1,
  MINIMUM_INTERVAL: 1,
  MAXIMUM_INTERVAL: 365,
  EASY_BONUS: 1.3,
  INTERVAL_MODIFIER: 2.5,
};

export const calculateNextReview = (card: Card, quality: number): Card => {
  const { INITIAL_INTERVAL, MINIMUM_INTERVAL } = SM2_CONSTANTS;

  if (quality < 3) {
    card.reviews = 0;
    card.interval = INITIAL_INTERVAL;
  } else {
    if (card.reviews === 0) {
      card.interval = INITIAL_INTERVAL;
    } else if (card.reviews === 1) {
      card.interval = MINIMUM_INTERVAL;
    } else {
      card.interval = Math.round(card.interval * card.easeFactor);
    }
    card.reviews += 1;
    const newEaseFactor =
      card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    card.easeFactor = Math.max(1.3, newEaseFactor);
  }

  card.lastReviewed = Date.now();
  card.dueDate = Date.now() + card.interval * 24 * 60 * 60 * 1000;

  return card;
};

export const updateCardStatusFromPerformance = (
  card: Card,
  quality: number
): void => {
  if (card.reviews === 1) {
    if (card.status === "no-status") {
      card.status = "visited";
    }
  } else if (card.reviews >= 3 && quality >= 3) {
    if (card.status === "visited") {
      card.status = "learning";
    }
  } else if (card.reviews >= 10 && card.interval >= 30 && quality >= 3) {
    if (card.status === "learning") {
      card.status = "learnt";
    }
  } else if (quality < 2 && card.reviews > 1) {
    if (card.status === "learnt") {
      card.status = "learning";
    } else if (card.status === "learning") {
      card.status = "visited";
    }
  }
};
