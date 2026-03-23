import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

const LOCAL_HISTORY_KEY = '@spotapp:reading_history';

export interface ReadingHistoryEntry {
  articleId: string;
  title?: string;
  category?: string;
  featuredImage?: string;
  readAt: string; // ISO string
  readDurationSeconds: number;
  progress: number; // 0-1
}

export function useReadingHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<ReadingHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      if (user) {
        const colRef = collection(db, `users/${user.uid}/reading_history`);
        const q = query(colRef, orderBy('readAt', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        const entries = snapshot.docs.map((d) => d.data() as ReadingHistoryEntry);
        setHistory(entries);
      } else {
        const raw = await AsyncStorage.getItem(LOCAL_HISTORY_KEY);
        if (raw) {
          const entries: ReadingHistoryEntry[] = JSON.parse(raw);
          setHistory(entries.slice(0, 50));
        }
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const recordReading = useCallback(
    async (
      articleId: string,
      durationSeconds: number,
      progress: number,
      meta?: { title?: string; category?: string; featuredImage?: string }
    ) => {
      const entry: ReadingHistoryEntry = {
        articleId,
        readAt: new Date().toISOString(),
        readDurationSeconds: Math.round(durationSeconds),
        progress: Math.min(1, Math.max(0, progress)),
        ...meta,
      };

      try {
        if (user) {
          await addDoc(collection(db, `users/${user.uid}/reading_history`), entry);
        } else {
          const updated = [entry, ...history.filter((h) => h.articleId !== articleId)].slice(0, 50);
          setHistory(updated);
          await AsyncStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(updated));
        }
      } catch {
        // ignore
      }
    },
    [user, history]
  );

  return { history, loading, recordReading };
}
