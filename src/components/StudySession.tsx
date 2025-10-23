import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { useApp } from "../context/AppContext";
import {
  calculateNextReview,
  updateCardStatusFromPerformance,
} from "../utils/sm2Algorithm";

export function StudySession() {
  const { state, dispatch } = useApp();
  const { cards, currentIndex, isActive } = state.studySession;

  if (!isActive || currentIndex >= cards.length) {
    dispatch({ type: "END_STUDY_SESSION" });
    return null;
  }

  const currentCard = cards[currentIndex];
  const [showAnswer, setShowAnswer] = React.useState(false);

  const handleRateCard = (quality: number) => {
    // Update card with SM-2 algorithm
    const updatedCard = calculateNextReview({ ...currentCard }, quality);
    updateCardStatusFromPerformance(updatedCard, quality);

    // Update in state
    dispatch({
      type: "UPDATE_CARD",
      payload: { id: currentCard.id, updates: updatedCard },
    });

    // Move to next card
    setShowAnswer(false);
    dispatch({ type: "NEXT_CARD" });
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <motion.div
      className="study-session"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="session-header">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="progress-text">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      <motion.div
        className="study-card"
        key={currentCard.id}
        initial={{ opacity: 0, rotateY: 90 }}
        animate={{ opacity: 1, rotateY: 0 }}
        exit={{ opacity: 0, rotateY: -90 }}
        transition={{ duration: 0.4 }}
      >
        <div className="card-header">
          <span className="card-difficulty">{currentCard.difficulty}</span>
          <span className="card-path">{currentCard.fullPath}</span>
        </div>

        <div className="card-content">
          <div className="question-section">
            <h3>Question</h3>
            <p>{currentCard.question}</p>
          </div>

          <AnimatePresence>
            {showAnswer && (
              <motion.div
                className="answer-section"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3>Answer</h3>
                <p>{currentCard.answer}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="card-actions">
          {!showAnswer ? (
            <button onClick={handleShowAnswer} className="btn-primary">
              Show Answer
            </button>
          ) : (
            <div className="rating-buttons">
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
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
