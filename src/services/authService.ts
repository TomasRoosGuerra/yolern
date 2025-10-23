import { 
  signInAnonymously, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { firestoreService } from './firestoreService';

class AuthService {
  private currentUser: User | null = null;
  private authStateListeners: ((user: User | null) => void)[] = [];

  constructor() {
    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      firestoreService.setUserId(user?.uid || null);
      
      // Notify all listeners
      this.authStateListeners.forEach(listener => listener(user));
    });
  }

  // Anonymous authentication (for quick start)
  async signInAnonymously(): Promise<User> {
    try {
      const result = await signInAnonymously(auth);
      return result.user;
    } catch (error) {
      console.error('Anonymous sign-in failed:', error);
      throw error;
    }
  }

  // Email/password authentication
  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error('Email sign-in failed:', error);
      throw error;
    }
  }

  async signUpWithEmail(email: string, password: string): Promise<User> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error('Email sign-up failed:', error);
      throw error;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      firestoreService.setUserId(null);
    } catch (error) {
      console.error('Sign-out failed:', error);
      throw error;
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Get user ID
  getUserId(): string | null {
    return this.currentUser?.uid || null;
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  // Get user display name or email
  getUserDisplayName(): string {
    if (!this.currentUser) return 'Guest';
    
    return this.currentUser.displayName || 
           this.currentUser.email?.split('@')[0] || 
           'Anonymous User';
  }

  // Check if user is anonymous
  isAnonymous(): boolean {
    return this.currentUser?.isAnonymous || false;
  }
}

export const authService = new AuthService();
