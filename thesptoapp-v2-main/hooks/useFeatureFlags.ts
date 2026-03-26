import { useEffect, useState } from "react";
import { getFeatureFlags, FeatureFlags } from "@/lib/version";

/**
 * Hook that reads feature flags from Firestore (app_config/features).
 * Admins toggle these from the dashboard; the app hides/shows features accordingly.
 */
export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getFeatureFlags()
      .then((f) => {
        if (!cancelled) setFlags(f);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { flags, loading };
}
