import { AnimatePresence, motion } from "framer-motion";
import { Brain, TreePine } from "lucide-react";
import { useState } from "react";
import { CardsView } from "./components/CardsView";
import { TreeView } from "./components/TreeView";
import { AuthComponent } from "./components/AuthComponent";
import { AppProvider, useApp } from "./context/AppContext";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import "./config/firebase"; // Initialize Firebase

function AppContent() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<"tree" | "cards">("tree");

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Show loading screen while Firebase initializes
  if (state.isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Initializing Yolern...</p>
        </div>
        <style jsx>{`
          .loading-screen {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: #f8f9fa;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
          }
          
          .loading-content {
            text-align: center;
            color: #666;
          }
          
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e5e5e7;
            border-top: 4px solid #007AFF;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

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
      {/* Show auth component if not authenticated */}
      {!state.isAuthenticated && <AuthComponent />}
      
      <header className="app-header">
        <h1>Yolern</h1>
        <p className="app-description">
          Visualize, organize, and track your learning across all devices
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
        <p>
          {state.isAuthenticated 
            ? "Your data syncs across all devices ☁️" 
            : "Sign in to sync your data across devices"
          }
        </p>
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
