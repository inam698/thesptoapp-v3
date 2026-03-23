import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

// Flag to prevent the auth listener from rejecting a user mid sign-up
let _signingUp = false;

export async function signIn(
  email: string,
  password: string
): Promise<{ user: User; isAdmin: boolean }> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  const userDoc = await getDoc(doc(db, "users", user.uid));
  const userData = userDoc.data();
  const isAdmin = userData?.role === "admin";

  if (!isAdmin) {
    await firebaseSignOut(auth);
    throw new Error("Access denied. You do not have admin privileges.");
  }

  return { user, isAdmin };
}

export async function signUp(
  email: string,
  password: string,
  displayName?: string
): Promise<User> {
  // Only an already-authenticated admin may create new admin accounts
  const caller = auth.currentUser;
  if (!caller) {
    throw new Error("You must be signed in as an admin to create accounts.");
  }
  const callerDoc = await getDoc(doc(db, "users", caller.uid));
  if (callerDoc.data()?.role !== "admin") {
    throw new Error("Only admins can create new admin accounts.");
  }

  _signingUp = true;
  try {
    // Create Firebase Auth user
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const user = credential.user;

    // Write admin document to Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      displayName: displayName || email.split("@")[0],
      role: "admin",
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });

    return user;
  } finally {
    _signingUp = false;
  }
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function checkAdminRole(uid: string): Promise<boolean> {
  // During sign-up, the Firestore doc is being written — trust the process
  if (_signingUp) return true;

  const userDoc = await getDoc(doc(db, "users", uid));
  const userData = userDoc.data();
  return userData?.role === "admin";
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
