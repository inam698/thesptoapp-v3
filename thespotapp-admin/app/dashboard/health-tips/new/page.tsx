"use client";

import HealthTipForm from "@/components/health-tips/HealthTipForm";

export default function NewHealthTipPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Create Health Tip
        </h1>
        <p className="text-gray-500 mt-1">
          Add a new health tip with multilingual support
        </p>
      </div>
      <HealthTipForm />
    </div>
  );
}
