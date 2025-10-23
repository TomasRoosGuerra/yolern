import { AnimatePresence, motion } from "framer-motion";
import {
  Brain,
  ChevronDown,
  ChevronRight,
  Edit2,
  Plus,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Card, TreeNode as TreeNodeType } from "../types";
import { calculateProgress } from "../utils/treeUtils";

interface TreeNodeProps {
  node: TreeNodeType;
  depth?: number;
}

const STATUS_COLORS = {
  "no-status": "#e5e7eb",
  visited: "#fbbf24",
  learning: "#3b82f6",
  learnt: "#10b981",
};

export function TreeNode({ node, depth = 0 }: TreeNodeProps) {
  const { state, dispatch } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(node.name);

  const hasCard = state.cardsData[node.id];
  const card = hasCard as Card;
  const progress = calculateProgress(node);
  const percentage =
    progress.total > 0 ? (progress.learnt / progress.total) * 100 : 0;

  const handleToggle = () => {
    dispatch({
      type: "UPDATE_NODE",
      payload: { id: node.id, updates: { isExpanded: !node.isExpanded } },
    });
  };

  const handleClick = () => {
    if (state.multiSelectMode) {
      dispatch({ type: "SELECT_NODE", payload: node.id });
    } else {
      dispatch({ type: "SET_SELECTED_NODE", payload: node.id });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(node.name);
  };

  const handleSave = () => {
    if (editValue.trim() && editValue !== node.name) {
      dispatch({
        type: "UPDATE_NODE",
        payload: { id: node.id, updates: { name: editValue.trim() } },
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(node.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  const handleAddChild = () => {
    const newNode = {
      id: crypto.randomUUID(),
      name: "New Topic",
      children: [],
      status: "no-status" as const,
      isExpanded: true,
    };
    dispatch({
      type: "ADD_NODE",
      payload: { parentId: node.id, node: newNode },
    });
  };

  const handleDelete = () => {
    if (confirm(`Delete "${node.name}"?`)) {
      dispatch({ type: "DELETE_NODE", payload: node.id });
    }
  };

  const cycleStatus = () => {
    const statuses: Array<"no-status" | "visited" | "learning" | "learnt"> = [
      "no-status",
      "visited",
      "learning",
      "learnt",
    ];
    const currentIndex = statuses.indexOf(node.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    dispatch({
      type: "UPDATE_NODE",
      payload: { id: node.id, updates: { status: nextStatus } },
    });
  };

  const isSelected = state.selectedNodeId === node.id;
  const isMultiSelected = state.selectedNodes.has(node.id);

  return (
    <div className="tree-node">
      <motion.div
        className={`node-content ${isSelected ? "selected" : ""} ${
          isMultiSelected ? "multi-selected" : ""
        }`}
        onClick={handleClick}
        style={{
          marginLeft: `${depth * 20}px`,
          borderLeft: hasCard
            ? `3px solid ${STATUS_COLORS[node.status]}`
            : "3px solid transparent",
          background: isSelected ? "#f3f4f6" : "transparent",
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="node-main">
          <button
            className="toggle-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
            style={{ opacity: node.children.length > 0 ? 1 : 0.3 }}
          >
            {node.children.length > 0 ? (
              node.isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )
            ) : (
              <div className="bullet" />
            )}
          </button>

          <button
            className="status-dot"
            onClick={(e) => {
              e.stopPropagation();
              cycleStatus();
            }}
            style={{ backgroundColor: STATUS_COLORS[node.status] }}
          />

          {hasCard && (
            <Brain
              size={14}
              className="card-indicator"
              style={{
                color:
                  card.reviews === 0
                    ? "#3b82f6"
                    : card.reviews >= 5 && card.interval >= 30
                    ? "#10b981"
                    : card.dueDate <= Date.now()
                    ? "#f59e0b"
                    : "#6b7280",
              }}
            />
          )}

          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="node-name-input"
              autoFocus
            />
          ) : (
            <span className="node-name">{node.name}</span>
          )}

          {state.multiSelectMode && (
            <input
              type="checkbox"
              checked={isMultiSelected}
              onChange={() =>
                dispatch({ type: "SELECT_NODE", payload: node.id })
              }
              className="multi-select-checkbox"
            />
          )}
        </div>

        {node.children.length > 0 && (
          <div className="progress-info">
            <span className="progress-text">
              {progress.learnt}/{progress.total}
            </span>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${percentage}%`,
                  background:
                    percentage === 100
                      ? "linear-gradient(90deg, #10b981 0%, #34d399 100%)"
                      : "linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)",
                }}
              />
            </div>
          </div>
        )}

        <div className="node-actions">
          <button onClick={handleEdit} title="Edit name">
            <Edit2 size={14} />
          </button>
          <button onClick={handleAddChild} title="Add child">
            <Plus size={14} />
          </button>
          <button onClick={handleDelete} title="Delete" className="danger">
            <Trash2 size={14} />
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {node.children.length > 0 && node.isExpanded && (
          <motion.div
            className="children"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {node.children.map((child) => (
              <TreeNode key={child.id} node={child} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
