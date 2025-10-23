import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Card } from "../types";

interface CardEditorProps {
  card: Card;
  onClose: () => void;
}

export function CardEditor({ card, onClose }: CardEditorProps) {
  const { dispatch } = useApp();
  const [question, setQuestion] = useState(card.question);
  const [answer, setAnswer] = useState(card.answer);

  const handleSave = () => {
    dispatch({
      type: "UPDATE_CARD",
      payload: {
        id: card.id,
        updates: {
          question,
          answer,
          isCustomized: true,
        },
      },
    });
    onClose();
  };

  const handleCancel = () => {
    setQuestion(card.question);
    setAnswer(card.answer);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal-content card-editor"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h3>Edit Card</h3>
            <button className="close-btn" onClick={onClose}>
              ×
            </button>
          </div>

          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="question">Question:</label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter the question..."
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="answer">Answer:</label>
              <textarea
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter the answer..."
                rows={4}
              />
            </div>

            <div className="card-info">
              <div className="info-item">
                <strong>Topic:</strong> {card.fullPath}
              </div>
              <div className="info-item">
                <strong>Difficulty:</strong> {card.difficulty}
              </div>
              <div className="info-item">
                <strong>Reviews:</strong> {card.reviews}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

