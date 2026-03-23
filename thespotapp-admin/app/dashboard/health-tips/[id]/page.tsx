"use client";

import { useParams } from "next/navigation";
import { useHealthTip } from "@/hooks/useHealthTips";
import HealthTipForm from "@/components/health-tips/HealthTipForm";
import Spinner from "@/components/ui/Spinner";

export default function EditHealthTipPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: healthTip, isLoading, error } = useHealthTip(id);

  if (isLoading) {
    return <Spinner className="py-20" />;
  }

  if (error || !healthTip) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Health tip not found
        </h2>
        <p className="text-gray-500 mt-1">
          The health tip you are looking for does not exist or has been deleted.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Health Tip</h1>
        <p className="text-gray-500 mt-1">Update health tip details</p>
      </div>
      <HealthTipForm healthTip={healthTip} />
    </div>
  );
}
