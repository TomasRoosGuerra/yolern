import {
  CheckSquare,
  ChevronsUp,
  Download,
  Expand,
  Plus,
  Redo,
  Search,
  Settings,
  Square,
  Undo,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  downloadFile,
  exportData,
  exportToCSV,
  importData,
  importDataFlexible,
  uploadFile,
} from "../utils/dataUtils";
import { DebugTools } from "./DebugTools";
import { TreeNode } from "./TreeNode";

export function TreeView() {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [debugToolsOpen, setDebugToolsOpen] = useState(false);

  const handleAddRoot = () => {
    const newNode = {
      id: crypto.randomUUID(),
      name: "New Topic",
      children: [],
      status: "no-status" as const,
      isExpanded: true,
    };
    dispatch({
      type: "ADD_NODE",
      payload: { parentId: "root", node: newNode },
    });
  };

  const handleExpandAll = () => {
    const expandNode = (node: any): any => ({
      ...node,
      isExpanded: true,
      children: node.children.map(expandNode),
    });
    dispatch({ type: "SET_TREE", payload: expandNode(state.treeData) });
  };

  const handleCollapseAll = () => {
    const collapseNode = (node: any): any => ({
      ...node,
      isExpanded: false,
      children: node.children.map(collapseNode),
    });
    dispatch({ type: "SET_TREE", payload: collapseNode(state.treeData) });
  };

  const handleToggleMultiSelect = () => {
    dispatch({ type: "TOGGLE_MULTI_SELECT" });
  };

  const handleUndo = () => {
    if (state.currentHistoryIndex > 0) {
      dispatch({ type: "UNDO" });
    }
  };

  const handleRedo = () => {
    if (state.currentHistoryIndex < state.actionHistory.length - 1) {
      dispatch({ type: "REDO" });
    }
  };

  const handleExport = () => {
    try {
      const data = exportData(state.treeData, state.cardsData);
      const timestamp = new Date().toISOString().split("T")[0];
      downloadFile(data, `learning-tracker-${timestamp}.json`);
    } catch (error) {
      alert(
        `Export failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleExportCSV = () => {
    try {
      const csv = exportToCSV(state.cardsData);
      const timestamp = new Date().toISOString().split("T")[0];
      downloadFile(csv, `learning-tracker-cards-${timestamp}.csv`, "text/csv");
    } catch (error) {
      alert(
        `CSV export failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleImport = async () => {
    try {
      const content = await uploadFile();

      // Try flexible import first, then fallback to strict import
      let treeData, cardsData;
      try {
        ({ treeData, cardsData } = importDataFlexible(content));
        console.log("Flexible import successful");
      } catch (flexibleError) {
        console.log(
          "Flexible import failed, trying strict import:",
          flexibleError
        );
        ({ treeData, cardsData } = importData(content));
      }

      if (confirm("This will replace your current data. Are you sure?")) {
        dispatch({ type: "SET_TREE", payload: treeData });
        dispatch({ type: "UPDATE_CARDS", payload: cardsData });
        alert("Data imported successfully!");
      }
    } catch (error) {
      console.error("Import error:", error);
      alert(
        `Import failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }\n\nPlease check the browser console for detailed error information.`
      );
    }
  };

  return (
    <div className="tree-view">
      <div className="tree-toolbar">
        <div className="toolbar-section">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={handleAddRoot} className="btn-primary">
            <Plus size={16} />
            New Topic
          </button>
        </div>

        <div className="toolbar-section">
          <button onClick={handleExpandAll} title="Expand All">
            <Expand size={16} />
          </button>
          <button onClick={handleCollapseAll} title="Collapse All">
            <ChevronsUp size={16} />
          </button>
          <button
            onClick={handleUndo}
            title="Undo"
            disabled={state.currentHistoryIndex <= 0}
          >
            <Undo size={16} />
          </button>
          <button
            onClick={handleRedo}
            title="Redo"
            disabled={
              state.currentHistoryIndex >= state.actionHistory.length - 1
            }
          >
            <Redo size={16} />
          </button>
          <button
            onClick={handleToggleMultiSelect}
            className={state.multiSelectMode ? "active" : ""}
            title="Multi-select Mode"
          >
            {state.multiSelectMode ? (
              <CheckSquare size={16} />
            ) : (
              <Square size={16} />
            )}
          </button>
        </div>

        <div className="toolbar-section">
          <button onClick={handleExport} title="Export Data">
            <Download size={16} />
          </button>
          <button onClick={handleExportCSV} title="Export Cards as CSV">
            📊
          </button>
          <button onClick={handleImport} title="Import Data">
            <Upload size={16} />
          </button>
          <button
            onClick={() => setDebugToolsOpen(true)}
            title="Debug Tools"
            className="debug-btn"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      <div className="tree-container">
        <TreeNode node={state.treeData} />
      </div>

      <DebugTools
        isOpen={debugToolsOpen}
        onClose={() => setDebugToolsOpen(false)}
      />
    </div>
  );
}
