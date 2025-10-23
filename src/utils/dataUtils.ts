import { Card, TreeNode } from "../types";

export interface ExportData {
  version: string;
  timestamp: number;
  treeData: TreeNode;
  cardsData: Record<string, Card>;
  metadata: {
    totalNodes: number;
    totalCards: number;
    exportedBy: string;
  };
}

export function exportData(
  treeData: TreeNode,
  cardsData: Record<string, Card>
): string {
  const exportData: ExportData = {
    version: "1.0.0",
    timestamp: Date.now(),
    treeData,
    cardsData,
    metadata: {
      totalNodes: countNodes(treeData),
      totalCards: Object.keys(cardsData).length,
      exportedBy: "Learning Tracker",
    },
  };

  return JSON.stringify(exportData, null, 2);
}

export function importData(jsonString: string): {
  treeData: TreeNode;
  cardsData: Record<string, Card>;
} {
  try {
    console.log("Importing JSON data:", jsonString.substring(0, 200) + "...");

    const data = JSON.parse(jsonString);
    console.log("Parsed data structure:", {
      hasTreeData: !!data.treeData,
      hasCardsData: !!data.cardsData,
      treeDataKeys: data.treeData ? Object.keys(data.treeData) : [],
      cardsDataKeys: data.cardsData ? Object.keys(data.cardsData) : [],
      version: data.version,
      timestamp: data.timestamp,
    });

    // Check if it's our export format
    if (data.version && data.treeData && data.cardsData) {
      // This is our export format
      console.log("Detected Learning Tracker export format");
    } else if (data.treeData || data.cardsData) {
      // This might be a direct tree/cards export
      console.log("Detected direct tree/cards format");
    } else if (data.id === "root" && data.children) {
      // This is a tree-only export (like your file)
      console.log("Detected tree-only format");
      return {
        treeData: data,
        cardsData: {},
      };
    } else {
      throw new Error(
        "Unknown data format. Expected Learning Tracker export format, direct tree/cards data, or tree-only data."
      );
    }

    // Validate the data structure
    if (
      !data.treeData &&
      !data.cardsData &&
      !(data.id === "root" && data.children)
    ) {
      throw new Error(
        "Invalid data format: missing treeData, cardsData, or valid tree structure"
      );
    }

    // Handle tree-only imports
    if (
      data.id === "root" &&
      data.children &&
      !data.treeData &&
      !data.cardsData
    ) {
      console.log("Processing tree-only import");
      return {
        treeData: data,
        cardsData: {},
      };
    }

    // Validate tree structure
    if (
      !data.treeData.id ||
      !data.treeData.name ||
      !Array.isArray(data.treeData.children)
    ) {
      console.error("Tree validation failed:", {
        hasId: !!data.treeData.id,
        hasName: !!data.treeData.name,
        childrenIsArray: Array.isArray(data.treeData.children),
        treeData: data.treeData,
      });
      throw new Error(
        "Invalid tree structure: missing required fields (id, name, children array)"
      );
    }

    // Validate cards structure
    if (typeof data.cardsData !== "object") {
      throw new Error("Invalid cards structure: cardsData must be an object");
    }

    // Validate some card properties
    const cardEntries = Object.entries(data.cardsData);
    if (cardEntries.length > 0) {
      const [firstCardId, firstCard] = cardEntries[0] as [string, any];
      if (!firstCard.id || !firstCard.question || !firstCard.answer) {
        console.error("Card validation failed:", firstCard);
        throw new Error(
          `Invalid card structure in card ${firstCardId}: missing required fields (id, question, answer)`
        );
      }
    }

    console.log("Import validation successful");
    return {
      treeData: data.treeData,
      cardsData: data.cardsData,
    };
  } catch (error) {
    console.error("Import error details:", error);
    throw new Error(
      `Failed to import data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export function downloadFile(
  content: string,
  filename: string,
  mimeType: string = "application/json"
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function uploadFile(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error("No file selected"));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    };

    input.oncancel = () => reject(new Error("File selection cancelled"));
    input.click();
  });
}

function countNodes(node: TreeNode): number {
  let count = 1;
  for (const child of node.children) {
    count += countNodes(child);
  }
  return count;
}

export function exportToCSV(cardsData: Record<string, Card>): string {
  const headers = [
    "Question",
    "Answer",
    "Status",
    "Difficulty",
    "Reviews",
    "Interval",
    "Due Date",
    "Folder",
    "Path",
    "Depth",
  ];

  const rows = Object.values(cardsData).map((card) => [
    `"${card.question.replace(/"/g, '""')}"`,
    `"${card.answer.replace(/"/g, '""')}"`,
    card.status,
    card.difficulty,
    card.reviews.toString(),
    card.interval.toString(),
    new Date(card.dueDate).toISOString(),
    card.folder,
    card.fullPath,
    card.depth.toString(),
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

export function importDataFlexible(jsonString: string): {
  treeData: TreeNode;
  cardsData: Record<string, Card>;
} {
  try {
    console.log("Attempting flexible import...");
    const data = JSON.parse(jsonString);

    // Try different import strategies
    if (data.version && data.treeData && data.cardsData) {
      // Strategy 1: Our export format
      console.log("Using Learning Tracker export format");
      return importData(jsonString);
    } else if (data.treeData && data.cardsData) {
      // Strategy 2: Direct tree/cards object
      console.log("Using direct tree/cards format");
      return importData(jsonString);
    } else if (data.taxonomyTree && data.cardsData) {
      // Strategy 3: Old format with different property names
      console.log("Converting old format (taxonomyTree -> treeData)");
      return {
        treeData: data.taxonomyTree,
        cardsData: data.cardsData,
      };
    } else if (Array.isArray(data)) {
      // Strategy 4: Array of cards only
      console.log("Converting cards array to cards object");
      const cardsData = data.reduce((acc, card) => {
        if (card.id) {
          acc[card.id] = card;
        }
        return acc;
      }, {} as Record<string, Card>);

      // Create a basic tree structure
      const treeData: TreeNode = {
        id: "root",
        name: "My Knowledge",
        children: [],
        status: "no-status",
        isExpanded: true,
      };

      return { treeData, cardsData };
    } else if (data.id === "root" && data.children) {
      // Strategy 5: Tree-only data (like your file)
      console.log("Processing tree-only data");
      return {
        treeData: data,
        cardsData: {},
      };
    } else {
      throw new Error(
        "Unrecognized data format. Please ensure your JSON contains treeData/cardsData, is a Learning Tracker export file, or is a valid tree structure."
      );
    }
  } catch (error) {
    console.error("Flexible import failed:", error);
    throw new Error(
      `Import failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
