"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { User } from "firebase/auth";
import { onAuthChange, checkAdminRole, signOut } from "@/lib/auth";

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

export function useAuthState(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const admin = await checkAdminRole(firebaseUser.uid);
        if (admin) {
          setUser(firebaseUser);
          setIsAdmin(true);
        } else {
          await signOut();
          setUser(null);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
    setUser(null);
    setIsAdmin(false);
  }, []);

  return { user, isAdmin, loading, signOut: handleSignOut };
}
