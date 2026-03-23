import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export interface FirestoreEntry {
  id: string;
  notes?: string;
  title?: string;
  [key: string]: any;
}

export function useFirestoreCollection(
  collectionPath: string | null,
  userId?: string,
  searchTerm?: string
) {
  const [data, setData] = useState<FirestoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);

    // If no collection path is provided, return empty data
    if (!collectionPath || collectionPath.trim() === "") {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Check if collectionPath already includes user ID (user-specific collection)
    const isUserSpecificCollection = collectionPath.includes("/users/");

    let q = query(collection(db, collectionPath), orderBy("timestamp", "desc"));

    // Only add userId filter if it's a global collection and userId is provided
    if (!isUserSpecificCollection && userId) {
      q = query(q, where("userId", "==", userId));
    }

    if (searchTerm) {
      // Firestore doesn't support full text search, so we filter client-side
      // after fetching all user's entries
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as FirestoreEntry[];
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          docs = docs.filter(
            (d) =>
              (d.notes && d.notes.toLowerCase().includes(term)) ||
              (d.title && d.title.toLowerCase().includes(term))
          );
        }
        setData(docs);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [collectionPath, userId, searchTerm]);

  // Add entry
  const addEntry = async (entry: Omit<FirestoreEntry, "id" | "timestamp">) => {
    if (!collectionPath || collectionPath.trim() === "") {
      setError("No collection path provided");
      return;
    }
    try {
      await addDoc(collection(db, collectionPath), {
        ...entry,
        timestamp: serverTimestamp(),
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Update entry
  const updateEntry = async (id: string, updates: Partial<FirestoreEntry>) => {
    if (!collectionPath || collectionPath.trim() === "") {
      setError("No collection path provided");
      return;
    }
    try {
      await updateDoc(doc(db, collectionPath, id), updates);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Delete entry
  const deleteEntry = async (id: string) => {
    if (!collectionPath || collectionPath.trim() === "") {
      setError("No collection path provided");
      return;
    }
    try {
      await deleteDoc(doc(db, collectionPath, id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { data, loading, error, addEntry, updateEntry, deleteEntry };
}
