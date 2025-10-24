import { User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useReducer } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { authService } from "../services/authService";
import { firestoreService } from "../services/firestoreService";
import { ActionHistory, Card, SyncStatus, TreeNode } from "../types";
import { generateCardsFromTree } from "../utils/treeUtils";

interface AppState {
  treeData: TreeNode;
  cardsData: Record<string, Card>;
  selectedNodeId: string | null;
  multiSelectMode: boolean;
  selectedNodes: Set<string>;
  actionHistory: ActionHistory[];
  currentHistoryIndex: number;
  syncStatus: SyncStatus;
  studySession: {
    cards: Card[];
    currentIndex: number;
    isActive: boolean;
  };
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AppAction =
  | { type: "SET_TREE"; payload: TreeNode }
  | { type: "UPDATE_NODE"; payload: { id: string; updates: Partial<TreeNode> } }
  | { type: "ADD_NODE"; payload: { parentId: string; node: TreeNode } }
  | { type: "DELETE_NODE"; payload: string }
  | { type: "MOVE_NODE"; payload: { nodeId: string; targetId: string } }
  | { type: "SET_SELECTED_NODE"; payload: string | null }
  | { type: "TOGGLE_MULTI_SELECT" }
  | { type: "SELECT_NODE"; payload: string }
  | { type: "CLEAR_SELECTION" }
  | { type: "ADD_ACTION"; payload: ActionHistory }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "UPDATE_CARDS"; payload: Record<string, Card> }
  | { type: "UPDATE_CARD"; payload: { id: string; updates: Partial<Card> } }
  | { type: "SET_SYNC_STATUS"; payload: SyncStatus }
  | { type: "START_STUDY_SESSION"; payload: Card[] }
  | { type: "END_STUDY_SESSION" }
  | { type: "NEXT_CARD" }
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_LOADING"; payload: boolean };

const initialState: AppState = {
  treeData: {
    id: "root",
    name: "My Knowledge",
    children: [
      {
        id: "sample-1",
        name: "JavaScript Fundamentals",
        children: [
          {
            id: "sample-1-1",
            name: "Variables and Data Types",
            children: [],
            status: "no-status",
            isExpanded: true,
          },
          {
            id: "sample-1-2",
            name: "Functions",
            children: [],
            status: "no-status",
            isExpanded: true,
          },
        ],
        status: "no-status",
        isExpanded: true,
      },
      {
        id: "sample-2",
        name: "CSS Styling",
        children: [
          {
            id: "sample-2-1",
            name: "Flexbox",
            children: [],
            status: "no-status",
            isExpanded: true,
          },
        ],
        status: "no-status",
        isExpanded: true,
      },
    ],
    status: "no-status",
    isExpanded: true,
  },
  cardsData: {},
  selectedNodeId: null,
  multiSelectMode: false,
  selectedNodes: new Set(),
  actionHistory: [],
  currentHistoryIndex: -1,
  syncStatus: { state: "synced", message: "Tree ↔️ Cards Synced" },
  studySession: {
    cards: [],
    currentIndex: 0,
    isActive: false,
  },
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_TREE":
      return { ...state, treeData: action.payload };

    case "UPDATE_NODE": {
      const updateNode = (node: TreeNode): TreeNode => {
        if (node.id === action.payload.id) {
          return { ...node, ...action.payload.updates };
        }
        return {
          ...node,
          children: node.children.map(updateNode),
        };
      };
      return { ...state, treeData: updateNode(state.treeData) };
    }

    case "ADD_NODE": {
      const addNodeToParent = (node: TreeNode): TreeNode => {
        if (node.id === action.payload.parentId) {
          return {
            ...node,
            children: [...node.children, action.payload.node],
            isExpanded: true,
          };
        }
        return {
          ...node,
          children: node.children.map(addNodeToParent),
        };
      };
      return { ...state, treeData: addNodeToParent(state.treeData) };
    }

    case "DELETE_NODE": {
      const deleteNode = (node: TreeNode): TreeNode => {
        return {
          ...node,
          children: node.children
            .filter((child) => child.id !== action.payload)
            .map(deleteNode),
        };
      };
      return { ...state, treeData: deleteNode(state.treeData) };
    }

    case "MOVE_NODE": {
      // Find and remove the node to move
      const findAndRemoveNode = (
        current: TreeNode
      ): { node: TreeNode | null; updatedTree: TreeNode } => {
        const childIndex = current.children.findIndex(
          (child) => child.id === action.payload.nodeId
        );
        if (childIndex !== -1) {
          const nodeToMove = current.children[childIndex];
          const updatedChildren = current.children.filter(
            (child) => child.id !== action.payload.nodeId
          );
          return {
            node: nodeToMove,
            updatedTree: { ...current, children: updatedChildren },
          };
        }

        // Recursively search in children
        for (let i = 0; i < current.children.length; i++) {
          const result = findAndRemoveNode(current.children[i]);
          if (result.node) {
            return {
              node: result.node,
              updatedTree: {
                ...current,
                children: current.children.map((child, index) =>
                  index === i ? result.updatedTree : child
                ),
              },
            };
          }
        }

        return { node: null, updatedTree: current };
      };

      // Find the target and add the node
      const addNodeToTarget = (current: TreeNode): TreeNode => {
        if (current.id === action.payload.targetId) {
          const nodeToMove = findAndRemoveNode(state.treeData).node;
          if (nodeToMove) {
            return { ...current, children: [...current.children, nodeToMove] };
          }
        }

        return {
          ...current,
          children: current.children.map(addNodeToTarget),
        };
      };

      const { node: nodeToMove, updatedTree } = findAndRemoveNode(
        state.treeData
      );
      if (nodeToMove) {
        const finalTree = addNodeToTarget(updatedTree);
        return { ...state, treeData: finalTree };
      }

      return state;
    }

    case "SET_SELECTED_NODE":
      return { ...state, selectedNodeId: action.payload };

    case "TOGGLE_MULTI_SELECT":
      return {
        ...state,
        multiSelectMode: !state.multiSelectMode,
        selectedNodes: new Set(),
      };

    case "SELECT_NODE": {
      const newSelected = new Set(state.selectedNodes);
      if (newSelected.has(action.payload)) {
        newSelected.delete(action.payload);
      } else {
        newSelected.add(action.payload);
      }
      return { ...state, selectedNodes: newSelected };
    }

    case "CLEAR_SELECTION":
      return { ...state, selectedNodes: new Set() };

    case "UPDATE_CARDS":
      return { ...state, cardsData: action.payload };

    case "UPDATE_CARD":
      return {
        ...state,
        cardsData: {
          ...state.cardsData,
          [action.payload.id]: {
            ...state.cardsData[action.payload.id],
            ...action.payload.updates,
          },
        },
      };

    case "SET_SYNC_STATUS":
      return { ...state, syncStatus: action.payload };

    case "START_STUDY_SESSION":
      return {
        ...state,
        studySession: {
          cards: action.payload,
          currentIndex: 0,
          isActive: true,
        },
      };

    case "END_STUDY_SESSION":
      return {
        ...state,
        studySession: {
          cards: [],
          currentIndex: 0,
          isActive: false,
        },
      };

    case "NEXT_CARD":
      return {
        ...state,
        studySession: {
          ...state.studySession,
          currentIndex: state.studySession.currentIndex + 1,
        },
      };

    case "ADD_ACTION": {
      const newHistory = [
        ...state.actionHistory.slice(0, state.currentHistoryIndex + 1),
        action.payload,
      ];
      return {
        ...state,
        actionHistory: newHistory,
        currentHistoryIndex: newHistory.length - 1,
      };
    }

    case "UNDO": {
      if (state.currentHistoryIndex > 0) {
        const actionToUndo = state.actionHistory[state.currentHistoryIndex];
        return {
          ...state,
          treeData: actionToUndo.treeSnapshot,
          currentHistoryIndex: state.currentHistoryIndex - 1,
        };
      }
      return state;
    }

    case "REDO": {
      if (state.currentHistoryIndex < state.actionHistory.length - 1) {
        const actionToRedo = state.actionHistory[state.currentHistoryIndex + 1];
        return {
          ...state,
          treeData: actionToRedo.treeSnapshot,
          currentHistoryIndex: state.currentHistoryIndex + 1,
        };
      }
      return state;
    }

    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: action.payload !== null,
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [treeData, setTreeData] = useLocalStorage(
    "taxonomyTree",
    initialState.treeData
  );
  const [cardsData, setCardsData] = useLocalStorage(
    "cardsData",
    initialState.cardsData
  );

  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    treeData,
    cardsData,
  });

  // Firebase authentication and sync
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      dispatch({ type: "SET_USER", payload: user });
      dispatch({ type: "SET_LOADING", payload: false });

      if (user) {
        // Load user data from Firestore
        loadUserDataFromFirestore();
      } else {
        // Fall back to localStorage
        dispatch({ type: "SET_TREE", payload: treeData });
      }
    });

    return unsubscribe;
  }, []);

  const loadUserDataFromFirestore = async () => {
    try {
      dispatch({
        type: "SET_SYNC_STATUS",
        payload: { state: "syncing", message: "Loading from cloud..." },
      });

      const firestoreTreeData = await firestoreService.getUserData();

      if (firestoreTreeData.length > 0) {
        // Convert array to tree structure
        const treeStructure = {
          id: "root",
          name: "My Knowledge",
          children: firestoreTreeData,
          status: "no-status" as const,
          isExpanded: true,
        };
        dispatch({ type: "SET_TREE", payload: treeStructure });
        dispatch({
          type: "SET_SYNC_STATUS",
          payload: { state: "synced", message: "Loaded from cloud ☁️" },
        });
      } else {
        // No cloud data, keep local data
        dispatch({
          type: "SET_SYNC_STATUS",
          payload: { state: "synced", message: "No cloud data, using local" },
        });
      }
    } catch (error) {
      console.error("Failed to load from Firestore:", error);
      dispatch({
        type: "SET_SYNC_STATUS",
        payload: { state: "error", message: "Load failed, using local data" },
      });
    }
  };

  const saveToFirestore = async (treeData: TreeNode) => {
    if (!authService.isAuthenticated()) return;

    try {
      dispatch({
        type: "SET_SYNC_STATUS",
        payload: { state: "syncing", message: "Saving to cloud..." },
      });

      // Convert tree to array format for Firestore
      const treeArray = treeData.children || [];
      await firestoreService.saveUserData(treeArray);

      dispatch({
        type: "SET_SYNC_STATUS",
        payload: { state: "synced", message: "Saved to cloud ☁️" },
      });
    } catch (error) {
      console.error("Failed to save to Firestore:", error);
      dispatch({
        type: "SET_SYNC_STATUS",
        payload: { state: "error", message: "Save failed" },
      });
    }
  };

  // Sync localStorage with state
  useEffect(() => {
    setTreeData(state.treeData);
  }, [state.treeData, setTreeData]);

  // Save to Firestore when tree data changes (debounced)
  useEffect(() => {
    if (authService.isAuthenticated() && !state.isLoading) {
      const timeoutId = setTimeout(() => {
        saveToFirestore(state.treeData);
      }, 1000); // Debounce for 1 second

      return () => clearTimeout(timeoutId);
    }
  }, [state.treeData]);

  useEffect(() => {
    setCardsData(state.cardsData);
  }, [state.cardsData, setCardsData]);

  // Auto-generate cards when tree changes
  useEffect(() => {
    const newCards = generateCardsFromTree(state.treeData);
    const mergedCards = { ...state.cardsData };

    newCards.forEach((card) => {
      if (mergedCards[card.id]) {
        // Preserve existing card data but update content
        mergedCards[card.id] = {
          ...mergedCards[card.id],
          ...card,
          reviews: mergedCards[card.id].reviews,
          interval: mergedCards[card.id].interval,
          easeFactor: mergedCards[card.id].easeFactor,
          dueDate: mergedCards[card.id].dueDate,
          lastReviewed: mergedCards[card.id].lastReviewed,
          question: mergedCards[card.id].isCustomized
            ? mergedCards[card.id].question
            : card.question,
          answer: mergedCards[card.id].isCustomized
            ? mergedCards[card.id].answer
            : card.answer,
        };
      } else {
        mergedCards[card.id] = card;
      }
    });

    // Remove cards for deleted nodes
    Object.keys(mergedCards).forEach((cardId) => {
      if (!newCards.find((card) => card.id === cardId)) {
        delete mergedCards[cardId];
      }
    });

    dispatch({ type: "UPDATE_CARDS", payload: mergedCards });
  }, [state.treeData]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
