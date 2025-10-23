import { useEffect } from "react";
import { useApp } from "../context/AppContext";

export function useKeyboardShortcuts() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;

      // Prevent default for our shortcuts
      if (
        isCtrlOrCmd ||
        e.key === "F2" ||
        e.key === "Delete" ||
        e.key === "Enter"
      ) {
        e.preventDefault();
      }

      switch (e.key) {
        case "n":
        case "N":
          if (isCtrlOrCmd) {
            // Add new root topic
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
          }
          break;

        case "F2":
          // Edit selected node
          if (state.selectedNodeId) {
            const nodeElement = document.querySelector(
              `[data-node-id="${state.selectedNodeId}"] .node-name`
            );
            if (nodeElement) {
              (nodeElement as HTMLElement).click();
            }
          }
          break;

        case "Enter":
          // Edit selected node
          if (state.selectedNodeId) {
            const nodeElement = document.querySelector(
              `[data-node-id="${state.selectedNodeId}"] .node-name`
            );
            if (nodeElement) {
              (nodeElement as HTMLElement).click();
            }
          }
          break;

        case "Delete":
          // Delete selected node(s)
          if (state.multiSelectMode && state.selectedNodes.size > 0) {
            // Bulk delete
            state.selectedNodes.forEach((nodeId) => {
              if (nodeId !== "root") {
                dispatch({ type: "DELETE_NODE", payload: nodeId });
              }
            });
            dispatch({ type: "CLEAR_SELECTION" });
          } else if (state.selectedNodeId && state.selectedNodeId !== "root") {
            // Single delete
            dispatch({ type: "DELETE_NODE", payload: state.selectedNodeId });
          }
          break;

        case "z":
        case "Z":
          if (isCtrlOrCmd && !isShift) {
            // Undo
            if (state.currentHistoryIndex > 0) {
              dispatch({ type: "UNDO" });
            }
          } else if (isCtrlOrCmd && isShift) {
            // Redo (Ctrl+Shift+Z)
            if (state.currentHistoryIndex < state.actionHistory.length - 1) {
              dispatch({ type: "REDO" });
            }
          }
          break;

        case "y":
        case "Y":
          if (isCtrlOrCmd) {
            // Redo (Ctrl+Y)
            if (state.currentHistoryIndex < state.actionHistory.length - 1) {
              dispatch({ type: "REDO" });
            }
          }
          break;

        case "m":
        case "M":
          if (isCtrlOrCmd && isShift) {
            // Toggle multi-select mode
            dispatch({ type: "TOGGLE_MULTI_SELECT" });
          }
          break;

        case "Escape":
          // Clear selection or exit multi-select mode
          if (state.multiSelectMode) {
            dispatch({ type: "TOGGLE_MULTI_SELECT" });
          } else {
            dispatch({ type: "SET_SELECTED_NODE", payload: null });
          }
          break;

        case "Tab":
          if (state.selectedNodeId) {
            // Cycle through siblings
            e.preventDefault();
            // This would require more complex logic to find siblings
            // For now, we'll just prevent the default tab behavior
          }
          break;

        case "ArrowUp":
        case "ArrowDown":
          if (state.selectedNodeId) {
            e.preventDefault();
            // Navigate through tree nodes
            // This would require more complex logic to find next/previous nodes
          }
          break;

        default:
          // Don't prevent default for other keys
          return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [state, dispatch]);
}

