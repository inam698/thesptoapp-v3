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
import { appendAuthDiagnostic } from './authDiagnostics';
import { auth, db, FIREBASE_API_KEY } from './firebase';

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

function normalizeEmailInput(email: string): string {
  return email.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
}

function normalizePasswordInput(password: string): string {
  // iPad copy/paste can include invisible chars or surrounding spaces from review notes.
  return password.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
}

// ── Helpers ─────────────────────────────────────────────────────────────

// Auth persistence is now handled natively by initializeAuth + getReactNativePersistence
// in lib/firebase.ts. No manual initialization needed.

/** Race a promise against a timeout. */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

/** Returns true if the error is transient and the request should be retried. */
function isRetryableError(error: any): boolean {
  if (error instanceof Error && error.message.includes('timed out')) return true;
  const code = (error as AuthError)?.code;
  return code === 'auth/network-request-failed' || code === 'auth/internal-error';
}

/** Returns true if the error is a credential / user issue (never retry). */
function isCredentialError(error: any): boolean {
  const code = (error as AuthError)?.code;
  return (
    code === 'auth/invalid-credential' ||
    code === 'auth/user-not-found' ||
    code === 'auth/wrong-password' ||
    code === 'auth/invalid-email' ||
    code === 'auth/user-disabled' ||
    code === 'auth/too-many-requests'
  );
}

/**
 * Lightweight connectivity pre-check.
 * Uses Apple's captive-portal detection URL — always reachable on any iOS/iPadOS
 * device with an active internet connection and not blocked by any corporate proxy.
 */
export async function checkConnectivity(): Promise<boolean> {
  async function probe(url: string, ms: number): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), ms);
      const res = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timer);
      return res.status < 600;
    } catch {
      return false;
    }
  }

  // Try Apple's captive-portal URL first, then fall back to Google's connectivity check.
  // iPadOS 26+ may restrict captive.apple.com in certain network configurations.
  if (await probe('https://captive.apple.com/hotspot-detect.html', 5000)) return true;
  return probe('https://www.google.com/generate_204', 5000);
}

/**
 * Direct REST API sign-in bypassing the Firebase JS SDK entirely.
 * Falls back to identitytoolkit REST API — works even when the SDK auth
 * instance is in a broken state or authStateReady() never resolves.
 */
async function signInViaRestApi(
  email: string,
  password: string,
): Promise<{ idToken: string; localId: string; email: string } | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
        signal: controller.signal,
      },
    );
    clearTimeout(timer);
    const data = await res.json();
    if (!res.ok) {
      void appendAuthDiagnostic('auth:restApi:error', {
        status: res.status,
        errorMessage: data?.error?.message,
      });
      return null;
    }
    void appendAuthDiagnostic('auth:restApi:success', { localId: data.localId });
    return data;
  } catch (e: any) {
    void appendAuthDiagnostic('auth:restApi:exception', { message: e?.message });
    return null;
  }
}

// Sign up with email and password
export async function signUp({ email, password, displayName }: SignUpData): Promise<AuthResponse> {
  try {
    const startedAt = Date.now();
    if (!auth) {
      console.error('[Auth] Firebase auth is not initialised');
      void appendAuthDiagnostic('auth:signUp:auth-missing');
      return { user: null, error: 'Sign up is temporarily unavailable. Please restart the app and try again.' };
    }

    const trimmedEmail = email.trim();
    console.log('[Auth] signUp attempt for:', trimmedEmail);
    void appendAuthDiagnostic('auth:signUp:start', { email: trimmedEmail });

    const userCredential = await withTimeout(
      createUserWithEmailAndPassword(auth, trimmedEmail, password),
      15000,
      'Sign up'
    );
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

    void appendAuthDiagnostic('auth:signUp:success', {
      uid: user.uid,
      elapsedMs: Date.now() - startedAt,
    });

    return { user, error: null };
  } catch (error: any) {
    console.error('[Auth] signUp error:', error?.code || error?.message || error);
    void appendAuthDiagnostic('auth:signUp:error', {
      code: error?.code,
      message: error?.message,
    });
    if (error instanceof Error && error.message.includes('timed out')) {
      return { user: null, error: 'Sign up is taking too long. Please check your internet connection and try again.' };
    }
    const authError = error as AuthError;
    return { user: null, error: getAuthErrorMessage(authError) };
  }
}

// Sign in with email and password
export async function signIn({ email, password }: SignInData): Promise<AuthResponse> {
  const startedAt = Date.now();
  try {
    // Validate that auth is initialised before attempting sign-in
    if (!auth) {
      console.error('[Auth] Firebase auth is not initialised');
      void appendAuthDiagnostic('auth:signIn:auth-missing');
      // Even without a valid auth instance, try the REST API as last resort
      return signInWithRestFallback(email, password, startedAt);
    }

    // NOTE: We intentionally do NOT gate on waitForAuthReady here.
    // signInWithEmailAndPassword makes a direct HTTP call to identitytoolkit.googleapis.com
    // and does NOT depend on the auth state being resolved. Gating on auth readiness
    // was causing sign-in to fail when authStateReady() hung on iOS 26.4.

    const normalizedEmail = normalizeEmailInput(email);
    const normalizedPassword = normalizePasswordInput(password);
    console.log('[Auth] signIn start for:', normalizedEmail);
    void appendAuthDiagnostic('auth:signIn:start', {
      email: normalizedEmail,
      passwordNormalized: normalizedPassword !== password,
    });

    // First attempt
    try {
      const userCredential = await withTimeout(
        signInWithEmailAndPassword(auth, normalizedEmail, normalizedPassword),
        30000,
        'Sign in'
      );
      const user = userCredential.user;
      console.log('[Auth] signIn success, uid:', user.uid);

      // Update Firestore in the background — do NOT block sign-in on this
      updateUserDocAfterSignIn(user).catch(() => {});
      void appendAuthDiagnostic('auth:signIn:success', {
        uid: user.uid,
        elapsedMs: Date.now() - startedAt,
        retried: false,
      });
      return { user, error: null };
    } catch (firstError: any) {
      // If it's a credential error, don't retry — fail immediately
      if (isCredentialError(firstError)) {
        // If the password appears to contain accidental surrounding spaces, retry once with raw input.
        if (normalizedPassword !== password) {
          console.warn('[Auth] signIn credential error after normalization, retrying with raw password');
          void appendAuthDiagnostic('auth:signIn:retry-raw-password', {
            code: firstError?.code,
          });
          const userCredential = await withTimeout(
            signInWithEmailAndPassword(auth, normalizedEmail, password),
            30000,
            'Sign in (raw password retry)'
          );
          const user = userCredential.user;
          console.log('[Auth] signIn success on raw-password retry, uid:', user.uid);
          updateUserDocAfterSignIn(user).catch(() => {});
          void appendAuthDiagnostic('auth:signIn:success', {
            uid: user.uid,
            elapsedMs: Date.now() - startedAt,
            retried: true,
            retryKind: 'raw-password',
          });
          return { user, error: null };
        }
        console.warn('[Auth] signIn credential error (no retry):', firstError.code);
        throw firstError;
      }

      // If it's a retryable (transient) error, try ONE more time
      if (isRetryableError(firstError)) {
        console.warn('[Auth] signIn transient error, retrying once:', firstError?.code || firstError?.message);
        void appendAuthDiagnostic('auth:signIn:retry-transient', {
          code: firstError?.code,
          message: firstError?.message,
        });
        // Brief pause before retry
        await new Promise(r => setTimeout(r, 1000));

        const userCredential = await withTimeout(
          signInWithEmailAndPassword(auth, normalizedEmail, normalizedPassword),
          30000,
          'Sign in (retry)'
        );
        const user = userCredential.user;
        console.log('[Auth] signIn success on retry, uid:', user.uid);

        updateUserDocAfterSignIn(user).catch(() => {});
        void appendAuthDiagnostic('auth:signIn:success', {
          uid: user.uid,
          elapsedMs: Date.now() - startedAt,
          retried: true,
          retryKind: 'transient',
        });
        return { user, error: null };
      }

      // Non-retryable, non-credential error — try REST API fallback
      console.warn('[Auth] signIn SDK non-retryable error, trying REST API fallback:', firstError?.code || firstError?.message);
      return signInWithRestFallback(normalizedEmail, normalizedPassword, startedAt);
    }
  } catch (error: any) {
    // Log in both dev and production so device logs can be inspected
    console.error('[Auth] signIn SDK failed:', error?.code || error?.message || error);
    void appendAuthDiagnostic('auth:signIn:sdkFailed:tryingRest', {
      code: error?.code,
      message: error?.message,
    });

    // Instead of immediately failing, try the REST API as a fallback.
    // This bypasses the Firebase JS SDK entirely and makes a direct HTTP call.
    const normalizedEmail = normalizeEmailInput(email);
    const normalizedPassword = normalizePasswordInput(password);
    return signInWithRestFallback(normalizedEmail, normalizedPassword, startedAt);
  }
}

/**
 * Fallback sign-in path: verify credentials via Firebase REST API, then
 * retry the SDK call. This handles cases where the Firebase JS SDK's internal
 * state machine is broken (e.g. authStateReady never resolves on iOS 26+)
 * but the network is actually fine.
 */
async function signInWithRestFallback(
  email: string,
  password: string,
  startedAt: number,
): Promise<AuthResponse> {
  void appendAuthDiagnostic('auth:signIn:restFallback:start');

  const restResult = await signInViaRestApi(email, password);

  if (!restResult) {
    // REST API also failed — genuine network or credential issue
    return {
      user: null,
      error: 'Unable to sign in. Please check your email, password, and internet connection, then try again.',
    };
  }

  // REST succeeded — credentials are valid. Try the SDK one more time.
  console.log('[Auth] REST API verified credentials, retrying SDK sign-in...');
  void appendAuthDiagnostic('auth:signIn:restFallback:restOk:retryingSdk');

  if (auth) {
    // Give the SDK a moment — the REST call may have "warmed up" the network path
    await new Promise(r => setTimeout(r, 500));

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const userCredential = await withTimeout(
          signInWithEmailAndPassword(auth, email, password),
          15000,
          `Sign in (REST-validated retry ${attempt})`,
        );
        const user = userCredential.user;
        console.log('[Auth] signIn success via REST-validated retry, uid:', user.uid);
        updateUserDocAfterSignIn(user).catch(() => {});
        void appendAuthDiagnostic('auth:signIn:restFallback:sdkRetrySuccess', {
          uid: user.uid,
          attempt,
          elapsedMs: Date.now() - startedAt,
        });
        return { user, error: null };
      } catch (retryErr: any) {
        console.warn(`[Auth] SDK retry ${attempt}/3 failed:`, retryErr?.code || retryErr?.message);
        void appendAuthDiagnostic('auth:signIn:restFallback:sdkRetryFail', {
          attempt,
          code: retryErr?.code,
          message: retryErr?.message,
        });
        if (attempt < 3) await new Promise(r => setTimeout(r, 1000 * attempt));
      }
    }
  }

  // SDK retries all failed but REST proved credentials are valid.
  // Return a special error that the UI can handle more gracefully.
  return {
    user: null,
    error: 'Your credentials are correct but sign-in encountered a temporary issue. Please close and reopen the app, then try again.',
  };
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
  } catch (error: any) {
    console.error('[Auth] logOut error:', error?.code || error?.message || error);
    const authError = error as AuthError;
    return { error: getAuthErrorMessage(authError) };
  }
}

// Send password reset email
export async function sendPasswordReset(email: string): Promise<{ error: string | null }> {
  try {
    await sendPasswordResetEmail(auth, email.trim());
    return { error: null };
  } catch (error: any) {
    console.error('[Auth] sendPasswordReset error:', error?.code || error?.message || error);
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
      return 'Sign in is temporarily unavailable. Please try again later or contact support.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign in is not enabled. Please contact support.';
    case 'auth/internal-error':
      return 'An internal error occurred. Please try again.';
    default:
      // Always log for debugging (visible in Xcode / device logs)
      console.error('[Auth] Unhandled auth error:', error.code, error.message);
      // NEVER expose raw Firebase error messages to the user
      return 'Something went wrong. Please check your connection and try again.';
  }
} 