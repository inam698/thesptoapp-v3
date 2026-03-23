"use client";

import { useParams } from "next/navigation";
import { useArticle } from "@/hooks/useArticles";
import ArticleForm from "@/components/articles/ArticleForm";
import Spinner from "@/components/ui/Spinner";

export default function EditArticlePage() {
  const params = useParams();
  const id = params.id as string;
  const { data: article, isLoading, error } = useArticle(id);

  if (isLoading) {
    return <Spinner className="py-20" />;
  }

  if (error || !article) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Article not found
        </h2>
        <p className="text-gray-500 mt-1">
          The article you are looking for does not exist or has been deleted.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Article</h1>
        <p className="text-gray-500 mt-1">Update article details</p>
      </div>
      <ArticleForm article={article} />
    </div>
  );
}
