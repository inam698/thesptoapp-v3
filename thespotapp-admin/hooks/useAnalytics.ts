"use client";

import { useQuery } from "@tanstack/react-query";
import { getArticleViewStats, getViewsOverTime } from "@/lib/firestore";

export function useArticleAnalytics() {
  return useQuery({
    queryKey: ["articleAnalytics"],
    queryFn: getArticleViewStats,
  });
}

export function useViewsOverTime() {
  return useQuery({
    queryKey: ["viewsOverTime"],
    queryFn: () => getViewsOverTime(30),
  });
}
