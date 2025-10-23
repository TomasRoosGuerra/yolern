import { Card, TreeNode } from "../types";

export const findNode = (root: TreeNode, targetId: string): TreeNode | null => {
  if (root.id === targetId) return root;

  for (const child of root.children) {
    const found = findNode(child, targetId);
    if (found) return found;
  }

  return null;
};

export const findPathToNode = (
  root: TreeNode,
  targetId: string,
  currentPath: string[] = []
): string[] | null => {
  if (root.id === targetId) {
    return [...currentPath, root.name];
  }

  for (const child of root.children) {
    const path = findPathToNode(child, targetId, [...currentPath, root.name]);
    if (path) return path;
  }

  return null;
};

export const findNodeByPath = (
  root: TreeNode,
  path: string[]
): TreeNode | null => {
  let current = root;

  for (const name of path) {
    if (current.children) {
      const found = current.children.find((child) => child.name === name);
      if (!found) return null;
      current = found;
    }
  }

  return current;
};

export const generateCardsFromTree = (treeData: TreeNode): Card[] => {
  const cards: Card[] = [];

  const traverseTree = (node: TreeNode, path: string[] = []) => {
    if (node.id !== "root") {
      const card = createCard(node, path);
      cards.push(card);
    }

    if (node.children) {
      node.children.forEach((child) =>
        traverseTree(child, [...path, node.name])
      );
    }
  };

  traverseTree(treeData);
  return cards;
};

const createCard = (node: TreeNode, path: string[]): Card => {
  const parentName = path[path.length - 1] || "Root";
  const children = node.children || [];

  const question = "What branch does this belong to?";
  const answer = `${node.name} belongs to ${parentName}.`;

  const difficulty = calculateDifficulty(node, path, children);
  const folder = path.length > 0 ? path[0] : node.name;
  const depth = path.length;

  return {
    id: node.id,
    question,
    answer,
    questionType: "branch-identification",
    status: node.status,
    path: [...path, node.name],
    fullPath: [...path, node.name].join(" → "),
    folder,
    depth,
    reviews: 0,
    interval: 1,
    easeFactor: 2.5,
    dueDate: Date.now(),
    lastReviewed: null,
    difficulty: difficulty.level,
    isCustomized: false,
    learningContext: {
      hierarchy: path.length,
      hasChildren: children.length > 0,
      isLeaf: children.length === 0,
      isBranch: children.length > 0,
      childCount: children.length,
    },
  };
};

const calculateDifficulty = (
  node: TreeNode,
  path: string[],
  children: TreeNode[]
) => {
  let level: "beginner" | "intermediate" | "advanced" = "beginner";
  let reason = "Basic concept";

  if (path.length >= 3) {
    level = "advanced";
    reason = "Deep hierarchical concept";
  } else if (path.length >= 1) {
    level = "intermediate";
    reason = "Intermediate concept";
  }

  if (children.length > 5) {
    level = "advanced";
    reason = "Complex concept with many sub-components";
  } else if (children.length > 2 && level === "beginner") {
    level = "intermediate";
    reason = "Concept with multiple components";
  }

  const complexWords = [
    "algorithm",
    "architecture",
    "implementation",
    "optimization",
    "integration",
  ];
  const hasComplexWords = complexWords.some((word) =>
    node.name.toLowerCase().includes(word)
  );

  if (hasComplexWords && level === "beginner") {
    level = "intermediate";
    reason = "Concept with technical complexity";
  }

  return { level, reason };
};

export const calculateProgress = (
  node: TreeNode
): { learnt: number; total: number } => {
  if (!node.children || node.children.length === 0) {
    return { learnt: node.status === "learnt" ? 1 : 0, total: 1 };
  }

  let totalLearnt = 0;
  let totalChildren = 0;

  node.children.forEach((child) => {
    const childProgress = calculateProgress(child);
    totalLearnt += childProgress.learnt;
    totalChildren += childProgress.total;
  });

  return { learnt: totalLearnt, total: totalChildren };
};

export const generateId = (): string => {
  return crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
};
