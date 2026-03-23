"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { uploadImage } from "@/lib/storage";
import { useCreateArticle, useUpdateArticle } from "@/hooks/useArticles";
import { useAutoSave } from "@/hooks/useAutoSave";
import type { Article } from "@/types";
import { ARTICLE_CATEGORIES, DIFFICULTY_OPTIONS } from "@/types";
import toast from "react-hot-toast";

const subsectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  order: z.number(),
  content: z.string().min(1, "Content is required"),
});

const sectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  order: z.number(),
  content: z.string().min(1, "Content is required"),
  subsections: z.array(subsectionSchema).optional(),
});

const articleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string().min(1, "Summary is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.string(),
  featuredImage: z.string(),
  estimatedReadTime: z.coerce.number().min(1, "Read time is required"),
  publishedDate: z.string().min(1, "Published date is required"),
  author: z.string().min(1, "Author is required"),
  sources: z.string(),
  isPublished: z.boolean(),
  difficulty: z.string().min(1, "Difficulty is required"),
  targetAudience: z.string(),
  sections: z.array(sectionSchema).min(1, "At least one section is required"),
  publishMode: z.enum(["draft", "publish", "schedule"]),
  scheduledPublishDate: z.string().optional(),
});

type FormValues = z.infer<typeof articleSchema>;

interface ArticleFormProps {
  article?: Article | null;
}

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

function safeDate(value: unknown): string {
  if (!value) return new Date().toISOString().split("T")[0];
  // Firestore Timestamp object
  if (typeof value === "object" && value !== null && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate().toISOString().split("T")[0];
  }
  // Firestore Timestamp with seconds
  if (typeof value === "object" && value !== null && "seconds" in value) {
    return new Date((value as { seconds: number }).seconds * 1000).toISOString().split("T")[0];
  }
  const d = new Date(value as string | number);
  return isNaN(d.getTime()) ? new Date().toISOString().split("T")[0] : d.toISOString().split("T")[0];
}

export default function ArticleForm({ article }: ArticleFormProps) {
  const router = useRouter();
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();
  const isEditing = !!article;

  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(article?.featuredImage ?? "");
  const [showDraftBanner, setShowDraftBanner] = useState(false);

  const defaultPublishMode = article?.status === "scheduled"
    ? "schedule"
    : article?.isPublished
      ? "publish"
      : "draft";

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: article?.title ?? "",
      summary: article?.summary ?? "",
      category: article?.category ?? "",
      tags: article?.tags?.join(", ") ?? "",
      featuredImage: article?.featuredImage ?? "",
      estimatedReadTime: article?.estimatedReadTime ?? 5,
      publishedDate: safeDate(article?.publishedDate),
      author: article?.author ?? "",
      sources: article?.sources?.join("\n") ?? "",
      isPublished: article?.isPublished ?? false,
      difficulty: article?.difficulty ?? "beginner",
      targetAudience: article?.targetAudience?.join(", ") ?? "",
      sections: article?.sections?.length
        ? article.sections.map((s) => ({
            ...s,
            subsections: s.subsections ?? [],
          }))
        : [{ id: generateId(), title: "", order: 0, content: "", subsections: [] }],
      publishMode: defaultPublishMode,
      scheduledPublishDate: article?.scheduledPublishDate ? safeDate(article.scheduledPublishDate) : "",
    },
  });

  // Auto-save draft
  const formValues = watch();
  const autoSaveKey = `article-draft-${article?.id ?? "new"}`;
  const { status: autoSaveStatus, lastSaved, hasDraft, restoreDraft, clearDraft } =
    useAutoSave(formValues as unknown as Record<string, unknown>, { key: autoSaveKey });

  const publishMode = watch("publishMode");

  // Show draft restore banner on mount
  useEffect(() => {
    if (!isEditing && hasDraft) {
      setShowDraftBanner(true);
    }
  }, [isEditing, hasDraft]);

  const {
    fields: sectionFields,
    append: appendSection,
    remove: removeSection,
  } = useFieldArray({ control, name: "sections" });

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      setUploading(true);
      try {
        const { downloadURL } = await uploadImage(file);
        setValue("featuredImage", downloadURL);
        setImagePreview(downloadURL);
        toast.success("Image uploaded");
      } catch (err) {
        toast.error("Failed to upload image");
      } finally {
        setUploading(false);
      }
    },
    [setValue]
  );

  const onSubmit = async (data: FormValues) => {
    const isScheduled = data.publishMode === "schedule";
    const isDraft = data.publishMode === "draft";

    const payload = {
      title: data.title,
      summary: data.summary,
      category: data.category as Article["category"],
      tags: data.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      featuredImage: data.featuredImage,
      estimatedReadTime: data.estimatedReadTime,
      publishedDate: data.publishedDate ? new Date(data.publishedDate).toISOString() : new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      author: data.author,
      sources: data.sources
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      isPublished: !isDraft && !isScheduled,
      difficulty: data.difficulty as Article["difficulty"],
      targetAudience: data.targetAudience
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      sections: data.sections.map((s, i) => ({
        ...s,
        order: i,
        subsections: (s.subsections ?? []).map((sub, j) => ({
          ...sub,
          order: j,
        })),
      })),
      status: (isDraft ? "draft" : isScheduled ? "scheduled" : "published") as "draft" | "scheduled" | "published",
      ...(isScheduled && data.scheduledPublishDate
        ? { scheduledPublishDate: (() => { const d = new Date(data.scheduledPublishDate); return isNaN(d.getTime()) ? undefined : d.toISOString(); })() }
        : {}),
    };

    try {
      if (isEditing) {
        await updateArticle.mutateAsync({ id: article.id, data: payload });
      } else {
        await createArticle.mutateAsync(payload);
      }
      clearDraft();
      router.push("/dashboard/articles");
    } catch {
      // Error toast is handled by the mutation hook
    }
  };

  const handleRestoreDraft = () => {
    const draft = restoreDraft();
    if (draft) {
      reset(draft as FormValues);
      setShowDraftBanner(false);
      toast.success("Draft restored");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
      {/* Draft restore banner */}
      {showDraftBanner && (
        <div
          className="rounded-xl p-4 flex items-center justify-between"
          style={{ backgroundColor: "#FEF9C3", border: "1.5px solid #FDE047" }}
        >
          <p className="text-sm font-medium" style={{ color: "#854D0E" }}>
            You have an unsaved draft. Would you like to restore it?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white"
              style={{ backgroundColor: "#9B6DAE" }}
            >
              Restore
            </button>
            <button
              type="button"
              onClick={() => { clearDraft(); setShowDraftBanner(false); }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg"
              style={{ color: "#854D0E", backgroundColor: "#FEF08A" }}
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Auto-save indicator */}
      {autoSaveStatus === "saved" && lastSaved && (
        <p className="text-xs" style={{ color: "#B8A9D1" }}>
          Draft auto-saved at {lastSaved.toLocaleTimeString()}
        </p>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">
            Basic Information
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Title"
            {...register("title")}
            error={errors.title?.message}
          />
          <Textarea
            label="Summary"
            {...register("summary")}
            error={errors.summary?.message}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              options={ARTICLE_CATEGORIES.map((c) => ({
                value: c.value,
                label: c.label,
              }))}
              placeholder="Select category"
              {...register("category")}
              error={errors.category?.message}
            />
            <Select
              label="Difficulty"
              options={DIFFICULTY_OPTIONS.map((d) => ({
                value: d.value,
                label: d.label,
              }))}
              {...register("difficulty")}
              error={errors.difficulty?.message}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Author"
              {...register("author")}
              error={errors.author?.message}
            />
            <Input
              label="Estimated Read Time (minutes)"
              type="number"
              min={1}
              {...register("estimatedReadTime")}
              error={errors.estimatedReadTime?.message}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Published Date"
              type="date"
              {...register("publishedDate")}
              error={errors.publishedDate?.message}
            />
          </div>
          <Input
            label="Tags (comma-separated)"
            placeholder="e.g. health, wellness, tips"
            {...register("tags")}
          />
          <Input
            label="Target Audience (comma-separated)"
            placeholder="e.g. teens, women, adults"
            {...register("targetAudience")}
          />
          {/* Publish Mode */}
          <div className="space-y-3">
            <label className="block text-sm font-medium" style={{ color: "#2E2E2E" }}>
              Publish Mode
            </label>
            <div className="flex gap-2">
              {(["draft", "publish", "schedule"] as const).map((mode) => (
                <label
                  key={mode}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer text-sm font-medium transition-all"
                  style={{
                    backgroundColor: publishMode === mode ? "#9B6DAE" : "#F5EEF8",
                    color: publishMode === mode ? "#fff" : "#9B6DAE",
                    border: `1.5px solid ${publishMode === mode ? "#9B6DAE" : "#E8D5F0"}`,
                  }}
                >
                  <input
                    type="radio"
                    value={mode}
                    {...register("publishMode")}
                    className="sr-only"
                  />
                  {mode === "draft" ? "Save as Draft" : mode === "publish" ? "Publish Now" : "Schedule"}
                </label>
              ))}
            </div>
            {publishMode === "schedule" && (
              <Input
                label="Scheduled Publish Date & Time"
                type="datetime-local"
                {...register("scheduledPublishDate")}
                error={errors.scheduledPublishDate?.message}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Featured Image */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">
            Featured Image
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <Input
                label="Image URL"
                {...register("featuredImage")}
                placeholder="Upload or paste URL"
              />
              <div className="mt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    loading={uploading}
                    onClick={() => {
                      const input = document.querySelector(
                        'input[type="file"]'
                      ) as HTMLInputElement;
                      input?.click();
                    }}
                  >
                    {uploading ? "Uploading..." : "Upload Image"}
                  </Button>
                </label>
              </div>
            </div>
            {imagePreview && (
              <div className="w-32 h-24 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sources */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Sources</h3>
        </CardHeader>
        <CardContent>
          <Textarea
            label="Sources (one per line)"
            placeholder="https://example.com/source-1&#10;https://example.com/source-2"
            rows={4}
            {...register("sources")}
          />
        </CardContent>
      </Card>

      {/* Sections */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Sections</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendSection({
                  id: generateId(),
                  title: "",
                  order: sectionFields.length,
                  content: "",
                  subsections: [],
                })
              }
            >
              Add Section
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {sectionFields.map((section, sIndex) => (
            <SectionEditor
              key={section.id}
              sectionIndex={sIndex}
              control={control}
              register={register}
              errors={errors}
              onRemove={() => removeSection(sIndex)}
              canRemove={sectionFields.length > 1}
            />
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3 justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/dashboard/articles")}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isSubmitting || createArticle.isPending || updateArticle.isPending}
        >
          {isEditing
            ? "Update Article"
            : publishMode === "draft"
              ? "Save Draft"
              : publishMode === "schedule"
                ? "Schedule Article"
                : "Publish Article"}
        </Button>
      </div>
    </form>
  );
}

// --- Section editor sub-component ---

interface SectionEditorProps {
  sectionIndex: number;
  control: any;
  register: any;
  errors: any;
  onRemove: () => void;
  canRemove: boolean;
}

function SectionEditor({
  sectionIndex,
  control,
  register,
  errors,
  onRemove,
  canRemove,
}: SectionEditorProps) {
  const {
    fields: subFields,
    append: appendSub,
    remove: removeSub,
  } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.subsections`,
  });

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700">
          Section {sectionIndex + 1}
        </h4>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700"
            onClick={onRemove}
          >
            Remove
          </Button>
        )}
      </div>

      <Input
        label="Section Title"
        {...register(`sections.${sectionIndex}.title`)}
        error={errors?.sections?.[sectionIndex]?.title?.message}
      />
      <Textarea
        label="Section Content"
        rows={4}
        {...register(`sections.${sectionIndex}.content`)}
        error={errors?.sections?.[sectionIndex]?.content?.message}
      />

      {/* Subsections */}
      <div className="pl-4 border-l-2 border-primary-200 space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Subsections
          </h5>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              appendSub({
                id: generateId(),
                title: "",
                order: subFields.length,
                content: "",
              })
            }
          >
            Add Subsection
          </Button>
        </div>

        {subFields.map((sub, subIndex) => (
          <div
            key={sub.id}
            className="bg-white border border-gray-200 rounded-lg p-3 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Subsection {subIndex + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700"
                onClick={() => removeSub(subIndex)}
              >
                Remove
              </Button>
            </div>
            <Input
              label="Subsection Title"
              {...register(
                `sections.${sectionIndex}.subsections.${subIndex}.title`
              )}
              error={
                errors?.sections?.[sectionIndex]?.subsections?.[subIndex]?.title
                  ?.message
              }
            />
            <Textarea
              label="Subsection Content"
              rows={3}
              {...register(
                `sections.${sectionIndex}.subsections.${subIndex}.content`
              )}
              error={
                errors?.sections?.[sectionIndex]?.subsections?.[subIndex]
                  ?.content?.message
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
