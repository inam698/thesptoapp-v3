"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/hooks/useAuth";
import Spinner from "@/components/ui/Spinner";

export default function HomePage() {
  const { user, isAdmin, loading } = useAuthState();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user && isAdmin) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [user, isAdmin, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
