"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getHealthTips,
  getHealthTip,
  createHealthTip,
  updateHealthTip,
  deleteHealthTip,
} from "@/lib/firestore";
import type { HealthTipFormData } from "@/types";
import toast from "react-hot-toast";

export function useHealthTips() {
  return useQuery({
    queryKey: ["healthTips"],
    queryFn: getHealthTips,
  });
}

export function useHealthTip(id: string) {
  return useQuery({
    queryKey: ["healthTips", id],
    queryFn: () => getHealthTip(id),
    enabled: !!id,
  });
}

export function useCreateHealthTip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: HealthTipFormData) => createHealthTip(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["healthTips"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      toast.success("Health tip created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create health tip: ${error.message}`);
    },
  });
}

export function useUpdateHealthTip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<HealthTipFormData>;
    }) => updateHealthTip(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["healthTips"] });
      queryClient.invalidateQueries({ queryKey: ["healthTips", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      toast.success("Health tip updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update health tip: ${error.message}`);
    },
  });
}

export function useDeleteHealthTip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteHealthTip(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["healthTips"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      toast.success("Health tip deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete health tip: ${error.message}`);
    },
  });
}
