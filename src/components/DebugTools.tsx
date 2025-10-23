import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { generateCardsFromTree } from "../utils/treeUtils";

interface DebugToolsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DebugTools({ isOpen, onClose }: DebugToolsProps) {
  const { state, dispatch } = useApp();
  const [debugInfo, setDebugInfo] = useState("");

  const generateDebugInfo = () => {
    const allCards = Object.values(state.cardsData);
    const now = Date.now();

    const stats = {
      totalNodes: countNodes(state.treeData),
      totalCards: allCards.length,
      dueCards: allCards.filter((card) => card.dueDate <= now).length,
      masteredCards: allCards.filter(
        (card) => card.reviews >= 10 && card.interval >= 30
      ).length,
      customizedCards: allCards.filter((card) => card.isCustomized).length,
      historyActions: state.actionHistory.length,
      currentHistoryIndex: state.currentHistoryIndex,
      syncStatus: state.syncStatus.state,
    };

    const treeStructure = JSON.stringify(state.treeData, null, 2);
    const cardsStructure = JSON.stringify(state.cardsData, null, 2);

    const info = `
=== LEARNING TRACKER DEBUG INFO ===
Generated: ${new Date().toISOString()}

STATISTICS:
- Total Nodes: ${stats.totalNodes}
- Total Cards: ${stats.totalCards}
- Due Cards: ${stats.dueCards}
- Mastered Cards: ${stats.masteredCards}
- Customized Cards: ${stats.customizedCards}
- History Actions: ${stats.historyActions}
- Current History Index: ${stats.currentHistoryIndex}
- Sync Status: ${stats.syncStatus}

TREE STRUCTURE:
${treeStructure}

CARDS STRUCTURE:
${cardsStructure}
`;

    setDebugInfo(info);
  };

  const clearAllData = () => {
    if (confirm("This will delete ALL your data. Are you absolutely sure?")) {
      if (confirm("This action cannot be undone. Type 'DELETE' to confirm.")) {
        localStorage.clear();
        window.location.reload();
      }
    }
  };

  const regenerateAllCards = () => {
    if (
      confirm(
        "This will regenerate all cards from the tree structure. Customized cards will be reset. Continue?"
      )
    ) {
      const newCards = generateCardsFromTree(state.treeData);
      const cardsObject = newCards.reduce((acc, card) => {
        acc[card.id] = card;
        return acc;
      }, {} as Record<string, any>);

      dispatch({ type: "UPDATE_CARDS", payload: cardsObject });
      alert("All cards regenerated successfully!");
    }
  };

  const validateDataIntegrity = () => {
    const issues: string[] = [];
    const allCards = Object.values(state.cardsData);

    // Check for orphaned cards (cards without corresponding tree nodes)
    allCards.forEach((card) => {
      if (!findNodeInTree(state.treeData, card.id)) {
        issues.push(`Orphaned card: ${card.id} (${card.question})`);
      }
    });

    // Check for missing cards (tree nodes without cards)
    const traverseTree = (node: any) => {
      if (node.id !== "root" && !state.cardsData[node.id]) {
        issues.push(`Missing card for node: ${node.id} (${node.name})`);
      }
      node.children?.forEach(traverseTree);
    };
    traverseTree(state.treeData);

    // Check for invalid card properties
    allCards.forEach((card) => {
      if (!card.question || !card.answer) {
        issues.push(`Invalid card properties: ${card.id}`);
      }
      if (card.dueDate < 0 || card.interval < 0 || card.reviews < 0) {
        issues.push(`Invalid card metrics: ${card.id}`);
      }
    });

    if (issues.length === 0) {
      alert("✅ Data integrity check passed! No issues found.");
    } else {
      alert(`❌ Found ${issues.length} issues:\n\n${issues.join("\n")}`);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(debugInfo);
    alert("Debug info copied to clipboard!");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-content debug-tools"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Debug Tools</h3>
              <button className="close-btn" onClick={onClose}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="debug-actions">
                <button className="btn-primary" onClick={generateDebugInfo}>
                  Generate Debug Info
                </button>
                <button
                  className="btn-secondary"
                  onClick={validateDataIntegrity}
                >
                  Validate Data
                </button>
                <button className="btn-secondary" onClick={regenerateAllCards}>
                  Regenerate Cards
                </button>
                <button className="btn-danger" onClick={clearAllData}>
                  Clear All Data
                </button>
              </div>

              {debugInfo && (
                <div className="debug-output">
                  <div className="debug-header">
                    <h4>Debug Information</h4>
                    <button className="btn-secondary" onClick={copyToClipboard}>
                      Copy to Clipboard
                    </button>
                  </div>
                  <pre className="debug-text">{debugInfo}</pre>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function countNodes(node: any): number {
  let count = 1;
  node.children?.forEach((child: any) => {
    count += countNodes(child);
  });
  return count;
}

function findNodeInTree(node: any, nodeId: string): boolean {
  if (node.id === nodeId) return true;
  return (
    node.children?.some((child: any) => findNodeInTree(child, nodeId)) || false
  );
}

