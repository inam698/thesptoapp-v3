import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAHQV9uuP4of7pqYuWy-0cmJNtSbKvfgMM",
  authDomain: "thespotapp-144e2.firebaseapp.com",
  projectId: "thespotapp-144e2",
  storageBucket: "thespotapp-144e2.firebasestorage.app",
  messagingSenderId: "889053884899",
  appId: "1:889053884899:web:ecf2c55bbb060947c430d6",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
