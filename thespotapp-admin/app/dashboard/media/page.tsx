"use client";

import { useState, useRef } from "react";
import { useMediaList, useUploadMedia, useDeleteMedia } from "@/hooks/useMedia";
import { useAuthState } from "@/hooks/useAuth";
import Spinner from "@/components/ui/Spinner";
import toast from "react-hot-toast";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaPage() {
  const { user } = useAuthState();
  const { data: items = [], isLoading } = useMediaList();
  const uploadMutation = useUploadMedia();
  const deleteMutation = useDeleteMedia();
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = items.filter((item) =>
    search.trim()
      ? item.fileName.toLowerCase().includes(search.toLowerCase())
      : true
  );

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      try {
        await uploadMutation.mutateAsync({
          file,
          uploadedBy: user?.email || "admin",
        });
        toast.success(`Uploaded ${file.name}`);
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (id: string, fileName: string, storagePath: string) => {
    if (!confirm(`Delete ${fileName}?`)) return;
    setDeleting(id);
    try {
      await deleteMutation.mutateAsync({ id, storagePath });
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
    setDeleting(null);
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#2E2E2E" }}>
            Media Library
          </h1>
          <p className="text-sm mt-1" style={{ color: "#B8A9D1" }}>
            Manage images used across articles and content
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #9B6DAE, #C69FD5)" }}
          >
            {uploadMutation.isPending ? (
              <Spinner size="sm" />
            ) : (
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            )}
            Upload Images
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search by filename..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl outline-none"
          style={{
            backgroundColor: "#F5EEF8",
            border: "1.5px solid #E8D5F0",
            color: "#2E2E2E",
          }}
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-2xl p-14 text-center"
          style={{
            backgroundColor: "#F5EEF8",
            border: "1.5px dashed #C69FD5",
          }}
        >
          <p className="text-sm font-semibold" style={{ color: "#9B6DAE" }}>
            {search ? "No images match your search" : "No images uploaded yet"}
          </p>
          <p className="text-xs mt-1" style={{ color: "#B8A9D1" }}>
            Upload images to use them in articles.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl overflow-hidden group"
              style={{
                backgroundColor: "#fff",
                border: "1.5px solid #E8D5F0",
              }}
            >
              <div className="aspect-square relative bg-gray-100">
                <img
                  src={item.url}
                  alt={item.fileName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => copyUrl(item.url)}
                    className="p-2 rounded-xl bg-white/90 text-sm"
                    title="Copy URL"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.fileName, item.storagePath || `admin-uploads/${item.fileName}`)}
                    disabled={deleting === item.id}
                    className="p-2 rounded-xl bg-red-500/90 text-white text-sm"
                    title="Delete"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p
                  className="text-xs font-medium truncate"
                  style={{ color: "#2E2E2E" }}
                >
                  {item.fileName}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: "#B8A9D1" }}>
                  {formatBytes(item.sizeBytes)} ·{" "}
                  {new Date(item.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs" style={{ color: "#B8A9D1" }}>
        {filtered.length} image{filtered.length !== 1 ? "s" : ""} in library
      </div>
    </div>
  );
}
