"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMediaItems, createMediaItem, deleteMediaItem } from "@/lib/firestore";
import { uploadImage, deleteImage } from "@/lib/storage";
import type { MediaItem } from "@/types";

export function useMediaList() {
  return useQuery({
    queryKey: ["media"],
    queryFn: getMediaItems,
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      file,
      uploadedBy,
    }: {
      file: File;
      uploadedBy: string;
    }): Promise<MediaItem> => {
      const { downloadURL, storagePath } = await uploadImage(file);
      const item = await createMediaItem({
        url: downloadURL,
        fileName: file.name,
        storagePath,
        contentType: file.type,
        sizeBytes: file.size,
        uploadedBy,
        uploadedAt: new Date().toISOString(),
      });
      return item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, storagePath }: { id: string; storagePath: string }) => {
      await deleteImage(storagePath);
      await deleteMediaItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
}
