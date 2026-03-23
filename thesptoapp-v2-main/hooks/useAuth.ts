import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Firebase auth persistence is handled natively via initializeAuth + AsyncStorage
    // in lib/firebase.ts — no need for manual session caching
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser) {
          // Check if user has been deactivated by an admin
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists() && userDoc.data()?.active === false) {
              await signOut(auth);
              Alert.alert(
                'Account Deactivated',
                'Your account has been deactivated. Please contact support for assistance.'
              );
              setUser(null);
              setIsLoading(false);
              return;
            }
          } catch {
            // Don't block auth on Firestore check failure
          }
        }
        setUser(firebaseUser);
        setIsLoading(false);
      },
      (_error) => {
        setUser(null);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
} 