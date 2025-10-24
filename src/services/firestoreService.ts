import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { TreeNode } from "../types";

export interface UserData {
  id: string;
  treeData: TreeNode[];
  lastUpdated: any;
  createdAt: any;
}

export interface StudySession {
  id: string;
  userId: string;
  cardId: string;
  difficulty: number;
  timestamp: any;
  interval: number;
  repetitions: number;
  easeFactor: number;
}

class FirestoreService {
  private userId: string | null = null;

  setUserId(userId: string) {
    this.userId = userId;
  }

  getUserId(): string | null {
    return this.userId;
  }

  // User data operations
  async saveUserData(treeData: TreeNode[]): Promise<void> {
    if (!this.userId) throw new Error("User not authenticated");

    const userRef = doc(db, "users", this.userId);
    await setDoc(
      userRef,
      {
        treeData,
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  async getUserData(): Promise<TreeNode[]> {
    if (!this.userId) throw new Error("User not authenticated");

    const userRef = doc(db, "users", this.userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data() as UserData;
      return data.treeData || [];
    }

    return [];
  }

  // Real-time data sync
  subscribeToUserData(callback: (treeData: TreeNode[]) => void): () => void {
    if (!this.userId) throw new Error("User not authenticated");

    const userRef = doc(db, "users", this.userId);

    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as UserData;
        callback(data.treeData || []);
      } else {
        callback([]);
      }
    });
  }

  // Study session operations
  async saveStudySession(
    session: Omit<StudySession, "id" | "userId" | "timestamp">
  ): Promise<void> {
    if (!this.userId) throw new Error("User not authenticated");

    const sessionsRef = collection(db, "studySessions");
    await setDoc(doc(sessionsRef), {
      ...session,
      userId: this.userId,
      timestamp: serverTimestamp(),
    });
  }

  async getStudySessions(cardId?: string): Promise<StudySession[]> {
    if (!this.userId) throw new Error("User not authenticated");

    const sessionsRef = collection(db, "studySessions");
    let q = query(
      sessionsRef,
      where("userId", "==", this.userId),
      orderBy("timestamp", "desc")
    );

    if (cardId) {
      q = query(
        sessionsRef,
        where("userId", "==", this.userId),
        where("cardId", "==", cardId),
        orderBy("timestamp", "desc")
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as StudySession[];
  }

  // Real-time study sessions
  subscribeToStudySessions(
    callback: (sessions: StudySession[]) => void
  ): () => void {
    if (!this.userId) throw new Error("User not authenticated");

    const sessionsRef = collection(db, "studySessions");
    const q = query(
      sessionsRef,
      where("userId", "==", this.userId),
      orderBy("timestamp", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      const sessions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as StudySession[];
      callback(sessions);
    });
  }

  // Backup and restore
  async exportUserData(): Promise<UserData> {
    if (!this.userId) throw new Error("User not authenticated");

    const userRef = doc(db, "users", this.userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { id: this.userId, ...userSnap.data() } as UserData;
    }

    throw new Error("User data not found");
  }

  async importUserData(userData: UserData): Promise<void> {
    if (!this.userId) throw new Error("User not authenticated");

    const userRef = doc(db, "users", this.userId);
    await setDoc(userRef, {
      treeData: userData.treeData,
      lastUpdated: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
  }
}

export const firestoreService = new FirestoreService();
