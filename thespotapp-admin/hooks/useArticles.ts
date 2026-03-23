"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
} from "@/lib/firestore";
import type { ArticleFormData } from "@/types";
import toast from "react-hot-toast";

export function useArticles() {
  return useQuery({
    queryKey: ["articles"],
    queryFn: getArticles,
  });
}

export function useArticle(id: string) {
  return useQuery({
    queryKey: ["articles", id],
    queryFn: () => getArticle(id),
    enabled: !!id,
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ArticleFormData) => createArticle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      toast.success("Article created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create article: ${error.message}`);
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ArticleFormData> }) =>
      updateArticle(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["articles", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      toast.success("Article updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update article: ${error.message}`);
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      toast.success("Article deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete article: ${error.message}`);
    },
  });
}
