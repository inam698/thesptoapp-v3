import {
    AuthError,
    createUserWithEmailAndPassword,
    deleteUser,
    EmailAuthProvider,
    reauthenticateWithCredential,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updatePassword,
    updateProfile,
    User,
} from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { Platform } from 'react-native';
import { auth, db } from './firebase';

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

export interface SignUpData {
  email: string;
  password: string;
  displayName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Auth persistence is now handled natively by initializeAuth + getReactNativePersistence
// in lib/firebase.ts. No manual initialization needed.

// Sign up with email and password
export async function signUp({ email, password, displayName }: SignUpData): Promise<AuthResponse> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update user profile with display name if provided
    if (displayName && user) {
      await updateProfile(user, { displayName });
    }

    // Send email verification
    try {
      await sendEmailVerification(user);
    } catch {
      // Don't block sign-up if verification email fails
    }

    // Write user metadata to Firestore so the admin dashboard can see this user
    try {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: displayName || user.email?.split('@')[0] || 'User',
        role: 'user',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        installedAt: new Date().toISOString(),
        platform: Platform.OS,
      });
    } catch {
      // Don't block sign-up if Firestore write fails
    }

    return { user, error: null };
  } catch (error) {
    const authError = error as AuthError;
    return { user: null, error: getAuthErrorMessage(authError) };
  }
}

// Helper: race a promise against a timeout
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

// Sign in with email and password
export async function signIn({ email, password }: SignInData): Promise<AuthResponse> {
  try {
    // Firebase Auth call with 15-second timeout to prevent infinite hang
    const userCredential = await withTimeout(
      signInWithEmailAndPassword(auth, email, password),
      15000,
      'Sign in'
    );
    const user = userCredential.user;

    // Update Firestore in the background — do NOT block sign-in on this
    updateUserDocAfterSignIn(user).catch(() => {
      // Silently ignore — Firestore update is non-critical
    });

    return { user, error: null };
  } catch (error) {
    // Handle timeout specifically
    if (error instanceof Error && error.message.includes('timed out')) {
      return { user: null, error: 'Sign in is taking too long. Please check your internet connection and try again.' };
    }
    const authError = error as AuthError;
    return { user: null, error: getAuthErrorMessage(authError) };
  }
}

// Separated Firestore update so it never blocks sign-in
async function updateUserDocAfterSignIn(user: User): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      await updateDoc(userRef, { lastLogin: serverTimestamp() });
    } else {
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        role: 'user',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });
    }
  } catch {
    // Don't block sign-in if Firestore write fails
  }
}

// Sign out
export async function logOut(): Promise<{ error: string | null }> {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    const authError = error as AuthError;
    return { error: getAuthErrorMessage(authError) };
  }
}

// Send password reset email
export async function sendPasswordReset(email: string): Promise<{ error: string | null }> {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error) {
    const authError = error as AuthError;
    return { error: getAuthErrorMessage(authError) };
  }
}

// Helper: delete all documents in a user's subcollection
async function deleteSubcollection(uid: string, subcollection: string): Promise<void> {
  const snap = await getDocs(collection(db, 'users', uid, subcollection));
  const deletes = snap.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(deletes);
}

// Delete user account and all associated Firestore data
export async function deleteAccount(): Promise<{ error: string | null }> {
  try {
    const user = auth.currentUser;
    if (!user) return { error: 'No user is currently signed in.' };

    // Clean up Firestore data before deleting the auth user
    try {
      await Promise.all([
        deleteSubcollection(user.uid, 'journal'),
        deleteSubcollection(user.uid, 'cycles'),
        deleteSubcollection(user.uid, 'logs'),
        deleteSubcollection(user.uid, 'bookmarks'),
        deleteSubcollection(user.uid, 'reading_history'),
      ]);
      await deleteDoc(doc(db, 'users', user.uid));
    } catch {
      // Continue with account deletion even if Firestore cleanup fails
    }

    await deleteUser(user);
    return { error: null };
  } catch (error) {
    const authError = error as AuthError;
    if (authError.code === 'auth/requires-recent-login') {
      return { error: 'For security, please sign out, sign in again, then try deleting your account.' };
    }
    return { error: getAuthErrorMessage(authError) };
  }
}

// Update user display name
export async function updateDisplayName(displayName: string): Promise<{ error: string | null }> {
  try {
    const user = auth.currentUser;
    if (!user) return { error: 'No user is currently signed in.' };
    await updateProfile(user, { displayName });
    return { error: null };
  } catch (error) {
    const authError = error as AuthError;
    return { error: getAuthErrorMessage(authError) };
  }
}

// Update user photo URL
export async function updatePhotoURL(photoURL: string): Promise<{ error: string | null }> {
  try {
    const user = auth.currentUser;
    if (!user) return { error: 'No user is currently signed in.' };
    await updateProfile(user, { photoURL });
    return { error: null };
  } catch (error) {
    const authError = error as AuthError;
    return { error: getAuthErrorMessage(authError) };
  }
}

// Change password (requires re-authentication)
export async function changePassword(currentPassword: string, newPassword: string): Promise<{ error: string | null }> {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) return { error: 'No user is currently signed in.' };
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
    return { error: null };
  } catch (error) {
    const authError = error as AuthError;
    return { error: getAuthErrorMessage(authError) };
  }
}

// Helper function to get user-friendly error messages
function getAuthErrorMessage(error: AuthError): string {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    case 'auth/configuration-not-found':
      return 'Firebase Authentication is not properly configured. Please check your Firebase settings.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    default:
      return error.message || 'An error occurred during authentication.';
  }
} 