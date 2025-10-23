import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyATun5HOJ6OMqitOWjLBwYTXsWnLUrFze0",
  authDomain: "yolern-fbeff.firebaseapp.com",
  projectId: "yolern-fbeff",
  storageBucket: "yolern-fbeff.firebasestorage.app",
  messagingSenderId: "882724763919",
  appId: "1:882724763919:web:18ccb1d88f30a890e4667a",
  measurementId: "G-KSZSPFW8CD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null;

export default app;
