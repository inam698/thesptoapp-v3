"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface AutoSaveOptions {
  key: string;
  intervalMs?: number;
}

interface AutoSaveReturn {
  lastSaved: Date | null;
  isSaving: boolean;
  status: "saved" | "saving" | "unsaved";
  restoreDraft: () => Record<string, unknown> | null;
  clearDraft: () => void;
  hasDraft: boolean;
}

export function useAutoSave(
  formData: Record<string, unknown>,
  { key, intervalMs = 30000 }: AutoSaveOptions
): AutoSaveReturn {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const dataRef = useRef(formData);
  const lastSavedDataRef = useRef<string>("");

  // Keep ref updated
  useEffect(() => {
    dataRef.current = formData;
  }, [formData]);

  // Check for existing draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        setHasDraft(true);
      }
    } catch {
      // ignore
    }
  }, [key]);

  // Auto-save interval
  useEffect(() => {
    const interval = setInterval(() => {
      const current = JSON.stringify(dataRef.current);
      // Only save if data has changed
      if (current !== lastSavedDataRef.current && current !== "{}") {
        setIsSaving(true);
        try {
          localStorage.setItem(key, current);
          lastSavedDataRef.current = current;
          setLastSaved(new Date());
          setHasDraft(true);
        } catch {
          // localStorage full or unavailable
        }
        setIsSaving(false);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [key, intervalMs]);

  const restoreDraft = useCallback((): Record<string, unknown> | null => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null;
  }, [key]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setHasDraft(false);
      lastSavedDataRef.current = "";
    } catch {
      // ignore
    }
  }, [key]);

  const status = isSaving ? "saving" : lastSaved ? "saved" : "unsaved";

  return { lastSaved, isSaving, status, restoreDraft, clearDraft, hasDraft };
}
