"use client";

import ArticleForm from "@/components/articles/ArticleForm";

export default function NewArticlePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Article</h1>
        <p className="text-gray-500 mt-1">
          Write a new health education article
        </p>
      </div>
      <ArticleForm />
    </div>
  );
}
