"use client";

import { useEffect, useState, useCallback } from "react";
import {
  collection,
  query,
  where,
  getCountFromServer,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface RealtimeMetrics {
  totalUsers: number;
  activeToday: number;
  totalViews: number;
  signupsOverTime: { month: string; count: number }[];
}

export function useRealtimeMetrics() {
  const [metrics, setMetrics] = useState<RealtimeMetrics>({
    totalUsers: 0,
    activeToday: 0,
    totalViews: 0,
    signupsOverTime: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    try {
      const usersRef = collection(db, "users");
      const viewsRef = collection(db, "article_views");

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

      // Use getCountFromServer for totals — no document downloads
      const [totalUsersSnap, totalViewsSnap, activeTodaySnap] =
        await Promise.all([
          getCountFromServer(query(usersRef)),
          getCountFromServer(query(viewsRef)),
          getCountFromServer(
            query(usersRef, where("lastLogin", ">=", todayStart))
          ),
        ]);

      // Signups over last 6 months — only fetch last 6 months of users
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const recentUsersSnap = await getDocs(
        query(usersRef, where("createdAt", ">=", sixMonthsAgo.toISOString()))
      );

      const months: { key: string; label: string }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        months.push({
          key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
          label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        });
      }

      const signupsOverTime = months.map((m) => {
        const count = recentUsersSnap.docs.filter((doc) => {
          const data = doc.data();
          const created =
            data.createdAt instanceof Timestamp
              ? data.createdAt.toDate().toISOString()
              : data.createdAt;
          if (!created) return false;
          const date = new Date(created);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          return key === m.key;
        }).length;
        return { month: m.label, count };
      });

      setMetrics({
        totalUsers: totalUsersSnap.data().count,
        totalViews: totalViewsSnap.data().count,
        activeToday: activeTodaySnap.data().count,
        signupsOverTime,
      });
    } catch {
      // Silently fail — dashboard will show zeros
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    // Refresh every 60 seconds instead of downloading live snapshots
    const interval = setInterval(fetchMetrics, 60_000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  return { metrics, loading };
}
