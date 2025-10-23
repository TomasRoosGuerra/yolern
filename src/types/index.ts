export interface TreeNode {
  id: string;
  name: string;
  children: TreeNode[];
  status: 'no-status' | 'visited' | 'learning' | 'learnt';
  isExpanded: boolean;
}

export interface Card {
  id: string;
  question: string;
  answer: string;
  questionType: 'branch-identification';
  status: 'no-status' | 'visited' | 'learning' | 'learnt';
  path: string[];
  fullPath: string;
  folder: string;
  depth: number;
  reviews: number;
  interval: number;
  easeFactor: number;
  dueDate: number;
  lastReviewed: number | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isCustomized: boolean;
  learningContext: {
    hierarchy: number;
    hasChildren: boolean;
    isLeaf: boolean;
    isBranch: boolean;
    childCount: number;
  };
}

export interface StudySession {
  cards: Card[];
  currentIndex: number;
  isActive: boolean;
}

export interface ActionHistory {
  type: string;
  nodeId?: string;
  oldValue?: any;
  newValue?: any;
  description: string;
  timestamp: number;
  treeSnapshot: TreeNode;
}

export interface SyncStatus {
  state: 'synced' | 'syncing' | 'error';
  message: string;
}
