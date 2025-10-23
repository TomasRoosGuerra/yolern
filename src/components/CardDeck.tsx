import { motion } from "framer-motion";
import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  calculateNextReview,
  updateCardStatusFromPerformance,
} from "../utils/sm2Algorithm";

export function CardDeck() {
  const { state, dispatch } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const cards = Object.values(state.cardsData);
  const currentCard = cards[currentIndex];

  if (cards.length === 0) {
    return (
      <div className="empty-deck">
        <h3>No cards available</h3>
        <p>Add some topics to your knowledge tree to start practicing!</p>
      </div>
    );
  }

  if (currentIndex >= cards.length) {
    return (
      <div className="deck-complete">
        <h2>🎉 Deck Complete!</h2>
        <p>You've reviewed all {cards.length} cards.</p>
        <button onClick={() => setCurrentIndex(0)} className="btn-primary">
          🔀 Shuffle & Restart
        </button>
      </div>
    );
  }

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    setCurrentX(0);
    setIsDragging(false);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!startX) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - startX;

    if (Math.abs(deltaX) > 10) {
      setIsDragging(true);
      setCurrentX(deltaX);
    }
  };

  const handleEnd = () => {
    if (!isDragging || !startX) {
      setStartX(0);
      return;
    }

    if (Math.abs(currentX) > 100) {
      const quality = currentX > 0 ? 3 : 1; // Right = Good, Left = Hard
      handleRateCard(quality);
    }

    setStartX(0);
    setCurrentX(0);
    setIsDragging(false);
  };

  const handleRateCard = (quality: number) => {
    const updatedCard = calculateNextReview({ ...currentCard }, quality);
    updateCardStatusFromPerformance(updatedCard, quality);

    dispatch({
      type: "UPDATE_CARD",
      payload: { id: currentCard.id, updates: updatedCard },
    });

    setCurrentIndex(currentIndex + 1);
    setIsFlipped(false);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const rotation = currentX * 0.1;
  const translateX = currentX;

  return (
    <div className="card-deck">
      <div className="deck-header">
        <span>
          {currentIndex + 1} / {cards.length}
        </span>
        <span>{cards.length - currentIndex} cards remaining</span>
      </div>

      <div className="card-stack">
        <motion.div
          className={`flashcard ${isFlipped ? "flipped" : ""}`}
          style={{
            transform: `translateX(${translateX}px) rotate(${rotation}deg)`,
          }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          onClick={handleFlip}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="card-inner">
            <div className="card-front">
              <div className="card-header">
                <span className="question-type">
                  {currentCard.questionType}
                </span>
                <span className="difficulty">{currentCard.difficulty}</span>
              </div>
              <div className="card-content">
                <p>{currentCard.question}</p>
              </div>
              <div className="card-meta">
                <span>{currentCard.fullPath}</span>
              </div>
            </div>
            <div className="card-back">
              <div className="card-content">
                <p>{currentCard.answer}</p>
              </div>
              <div className="card-meta">
                <span>
                  Reviews: {currentCard.reviews} | Interval:{" "}
                  {currentCard.interval}d
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {isFlipped && (
          <motion.div
            className="rating-buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={() => handleRateCard(0)}
              className="btn-rating again"
            >
              😫 Again
            </button>
            <button
              onClick={() => handleRateCard(1)}
              className="btn-rating hard"
            >
              😓 Hard
            </button>
            <button
              onClick={() => handleRateCard(3)}
              className="btn-rating good"
            >
              😊 Good
            </button>
            <button
              onClick={() => handleRateCard(4)}
              className="btn-rating easy"
            >
              😎 Easy
            </button>
          </motion.div>
        )}
      </div>

      <div className="swipe-indicators">
        <div className="swipe-left">👎</div>
        <div className="swipe-right">👍</div>
      </div>
    </div>
  );
}
