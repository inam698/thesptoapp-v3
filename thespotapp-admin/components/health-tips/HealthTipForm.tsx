"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import Tabs from "@/components/ui/Tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useCreateHealthTip, useUpdateHealthTip } from "@/hooks/useHealthTips";
import type { HealthTip, SupportedLanguage } from "@/types";
import { SUPPORTED_LANGUAGES, LANGUAGE_LABELS } from "@/types";

const translationSchema = z.object({
  title: z.string(),
  body: z.string(),
});

const formSchema = z.object({
  numericId: z.coerce.number().min(0, "ID must be 0 or greater"),
  emoji: z.string().min(1, "Emoji is required"),
  translations: z.object(
    Object.fromEntries(
      SUPPORTED_LANGUAGES.map((lang) => [lang, translationSchema])
    ) as Record<SupportedLanguage, typeof translationSchema>
  ),
}).refine(
  (data) =>
    data.translations.en.title.length > 0 &&
    data.translations.en.body.length > 0,
  {
    message: "English title and body are required",
    path: ["translations", "en", "title"],
  }
);

type FormValues = z.infer<typeof formSchema>;

interface HealthTipFormProps {
  healthTip?: HealthTip | null;
}

function buildDefaultTranslations(tip?: HealthTip | null) {
  const translations: Record<string, { title: string; body: string }> = {};
  for (const lang of SUPPORTED_LANGUAGES) {
    translations[lang] = {
      title: tip?.translations?.[lang]?.title ?? "",
      body: tip?.translations?.[lang]?.body ?? "",
    };
  }
  return translations;
}

export default function HealthTipForm({ healthTip }: HealthTipFormProps) {
  const router = useRouter();
  const createTip = useCreateHealthTip();
  const updateTip = useUpdateHealthTip();
  const isEditing = !!healthTip;

  const [activeTab, setActiveTab] = useState<string>("en");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numericId: healthTip?.numericId ?? 0,
      emoji: healthTip?.emoji ?? "",
      translations: buildDefaultTranslations(healthTip) as any,
    },
  });

  const languageTabs = SUPPORTED_LANGUAGES.map((lang) => ({
    key: lang,
    label: LANGUAGE_LABELS[lang],
  }));

  const onSubmit = async (data: FormValues) => {
    const payload = {
      numericId: data.numericId,
      emoji: data.emoji,
      translations: data.translations as HealthTip["translations"],
    };

    try {
      if (isEditing) {
        await updateTip.mutateAsync({ id: healthTip.id, data: payload });
      } else {
        await createTip.mutateAsync(payload);
      }
      router.push("/dashboard/health-tips");
    } catch {
      // Error handled by mutation hook
    }
  };

  // Dig into nested error for the English validation
  const englishError =
    (errors as any)?.translations?.en?.title?.message ||
    (errors as any)?.translations?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">
            Basic Information
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Numeric ID"
              type="number"
              min={0}
              {...register("numericId")}
              error={errors.numericId?.message}
            />
            <div>
              <Input
                label="Emoji"
                placeholder="Paste an emoji here"
                {...register("emoji")}
                error={errors.emoji?.message}
              />
              {/* Preview */}
              <p className="mt-1 text-2xl">{/* rendered by watcher if needed */}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Translations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Translations
            </h3>
            <span className="text-xs text-gray-500">
              English is required; other languages are optional
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {englishError && (
            <p className="text-sm text-red-600">{englishError}</p>
          )}

          <Tabs tabs={languageTabs} activeTab={activeTab} onChange={setActiveTab} />

          <div className="mt-4">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <div
                key={lang}
                className={activeTab === lang ? "space-y-4" : "hidden"}
              >
                <Input
                  label={`Title (${LANGUAGE_LABELS[lang]})`}
                  placeholder={
                    lang === "en"
                      ? "Enter title"
                      : `Enter ${LANGUAGE_LABELS[lang]} title (optional)`
                  }
                  {...register(`translations.${lang}.title`)}
                />
                <Textarea
                  label={`Body (${LANGUAGE_LABELS[lang]})`}
                  placeholder={
                    lang === "en"
                      ? "Enter body text"
                      : `Enter ${LANGUAGE_LABELS[lang]} body (optional)`
                  }
                  rows={4}
                  {...register(`translations.${lang}.body`)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3 justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/dashboard/health-tips")}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isSubmitting || createTip.isPending || updateTip.isPending}
        >
          {isEditing ? "Update Health Tip" : "Create Health Tip"}
        </Button>
      </div>
    </form>
  );
}
