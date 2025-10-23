import { AnimatePresence, motion } from "framer-motion";
import { Brain, TreePine } from "lucide-react";
import { useState } from "react";
import { CardsView } from "./components/CardsView";
import { TreeView } from "./components/TreeView";
import { AppProvider, useApp } from "./context/AppContext";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

function AppContent() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<"tree" | "cards">("tree");

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  const getSyncIcon = () => {
    switch (state.syncStatus.state) {
      case "synced":
        return "✓";
      case "syncing":
        return "⟳";
      case "error":
        return "⚠";
      default:
        return "🔗";
    }
  };

  const getSyncClass = () => {
    switch (state.syncStatus.state) {
      case "synced":
        return "sync-synced";
      case "syncing":
        return "sync-syncing";
      case "error":
        return "sync-error";
      default:
        return "sync-normal";
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Learning Tracker</h1>
        <p className="app-description">
          Visualize, organize, and track your learning (grasping, not
          understanding)
        </p>
        <div className={`sync-indicator ${getSyncClass()}`}>
          <span className="sync-icon">{getSyncIcon()}</span>
          <span className="sync-text">{state.syncStatus.message}</span>
        </div>
      </header>

      <nav className="tab-navigation">
        <button
          className={`tab-button ${activeTab === "tree" ? "active" : ""}`}
          onClick={() => setActiveTab("tree")}
        >
          <TreePine size={16} />
          Knowledge Tree
        </button>
        <button
          className={`tab-button ${activeTab === "cards" ? "active" : ""}`}
          onClick={() => setActiveTab("cards")}
        >
          <Brain size={16} />
          Spaced Repetition
        </button>
      </nav>

      <main className="main-content">
        <AnimatePresence mode="wait">
          {activeTab === "tree" && (
            <motion.div
              key="tree"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="view-container"
            >
              <TreeView />
            </motion.div>
          )}

          {activeTab === "cards" && (
            <motion.div
              key="cards"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="view-container"
            >
              <CardsView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="app-footer">
        <p>Your data is stored locally in your browser's localStorage.</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
