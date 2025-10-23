import { motion } from "framer-motion";
import { Brain, Edit2, Play, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { CardDeck } from "./CardDeck";
import { CardEditor } from "./CardEditor";
import { StudySession } from "./StudySession";

type ViewMode = "list" | "study" | "deck";

export function CardsView() {
  const { state, dispatch } = useApp();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    folder: "all",
    status: "all",
    studyMode: "breadth-first",
    difficulty: "all",
  });

  const allCards = Object.values(state.cardsData);
  const now = Date.now();

  const stats = {
    total: allCards.length,
    due: allCards.filter((card) => card.dueDate <= now).length,
    mastered: allCards.filter(
      (card) => card.reviews >= 10 && card.interval >= 30
    ).length,
  };

  const filteredCards = allCards.filter((card) => {
    if (filters.folder !== "all" && card.folder !== filters.folder)
      return false;
    if (filters.status !== "all" && card.status !== filters.status)
      return false;
    if (filters.difficulty !== "all" && card.difficulty !== filters.difficulty)
      return false;

    if (filters.studyMode === "due") return card.dueDate <= now;
    if (filters.studyMode === "new") return card.reviews === 0;
    if (filters.studyMode === "review") return card.reviews > 0;

    return true;
  });

  const sortedCards = [...filteredCards].sort((a, b) => {
    if (filters.studyMode === "breadth-first") {
      if (a.depth !== b.depth) return a.depth - b.depth;
      const aOverdue = a.dueDate < now;
      const bOverdue = b.dueDate < now;
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      return Math.random() - 0.5;
    }
    return 0;
  });

  const handleStartStudy = () => {
    dispatch({
      type: "START_STUDY_SESSION",
      payload: sortedCards.slice(0, 25),
    });
    setViewMode("study");
  };

  const handleRegenerateCards = () => {
    if (
      confirm(
        "Regenerate all cards? This will reset all card questions/answers to the new simplified format. Learning progress will be preserved."
      )
    ) {
      dispatch({ type: "UPDATE_CARDS", payload: {} });
      alert("All cards regenerated successfully!");
    }
  };

  const folders = [...new Set(allCards.map((card) => card.folder))];

  if (state.studySession.isActive) {
    return <StudySession />;
  }

  return (
    <div className="cards-view">
      <div className="cards-toolbar">
        <div className="toolbar-section">
          <div className="stats-compact">
            <div className="stat">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat highlight">
              <span className="stat-value">{stats.due}</span>
              <span className="stat-label">Due</span>
            </div>
            <div className="stat">
              <span className="stat-value">{stats.mastered}</span>
              <span className="stat-label">Mastered</span>
            </div>
          </div>
        </div>

        <div className="toolbar-section">
          <select
            value={filters.folder}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, folder: e.target.value }))
            }
            className="filter-select"
          >
            <option value="all">📁 All Folders</option>
            {folders.map((folder) => (
              <option key={folder} value={folder}>
                📁 {folder}
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="no-status">Not Started</option>
            <option value="visited">Visited</option>
            <option value="learning">Learning</option>
            <option value="learnt">Learnt</option>
          </select>

          <select
            value={filters.studyMode}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, studyMode: e.target.value }))
            }
            className="filter-select"
          >
            <option value="breadth-first">
              🎯 Breadth-First (Recommended)
            </option>
            <option value="due">Due Cards</option>
            <option value="all">All Cards</option>
            <option value="new">New Only</option>
            <option value="review">Review Only</option>
          </select>

          <select
            value={filters.difficulty}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, difficulty: e.target.value }))
            }
            className="filter-select"
          >
            <option value="all">All Difficulty</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className="toolbar-section">
          <button
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "active" : ""}
          >
            <Brain size={16} />
            List
          </button>
          <button
            onClick={() => setViewMode("deck")}
            className={viewMode === "deck" ? "active" : ""}
          >
            <Brain size={16} />
            Deck
          </button>
          <button onClick={handleRegenerateCards} title="Regenerate all cards">
            <RotateCcw size={16} />
          </button>
          <button onClick={handleStartStudy} className="btn-primary">
            <Play size={16} />
            Start Session
          </button>
        </div>
      </div>

      <div className="cards-content">
        {viewMode === "list" && (
          <div className="cards-list">
            {sortedCards.map((card) => (
              <motion.div
                key={card.id}
                className="card-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="card-header">
                  <span className="card-question">{card.question}</span>
                  <button
                    className="edit-card-btn"
                    onClick={() => setEditingCard(card.id)}
                    title="Edit card"
                  >
                    <Edit2 size={14} />
                  </button>
                  <div className="card-badges">
                    <span className="folder-badge">📁 {card.folder}</span>
                    <span className="depth-badge">L{card.depth}</span>
                    <span className="difficulty-badge">{card.difficulty}</span>
                    <span className={`status-badge ${card.status}`}>
                      {card.status}
                    </span>
                    {card.isCustomized && (
                      <span className="customized-badge">✏️</span>
                    )}
                  </div>
                </div>
                <div className="card-content">
                  <p>
                    <strong>Answer:</strong> {card.answer}
                  </p>
                </div>
                <div className="card-meta">
                  <span>
                    Reviews: {card.reviews} | Interval: {card.interval}d
                  </span>
                  <span>
                    Due: {new Date(card.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {viewMode === "deck" && <CardDeck />}
      </div>

      {/* Card Editor Modal */}
      {editingCard && state.cardsData[editingCard] && (
        <CardEditor
          card={state.cardsData[editingCard]}
          onClose={() => setEditingCard(null)}
        />
      )}
    </div>
  );
}
