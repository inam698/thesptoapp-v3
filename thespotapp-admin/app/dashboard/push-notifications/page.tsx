"use client";

import { useState } from "react";
import { getUsers } from "@/lib/firestore";

// ── Icons ────────────────────────────────────────────────────────────────────

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}
function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  );
}
function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}
function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sz = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-5 w-5";
  return (
    <svg className={`${sz} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Types ────────────────────────────────────────────────────────────────────

type Target = "all" | "app_users" | "admins";

interface SendResult {
  ok: boolean;
  sent: number;
  message: string;
}

// ── Expo push helper ─────────────────────────────────────────────────────────

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

async function sendInBatches(
  tokens: string[],
  title: string,
  body: string
): Promise<number> {
  const BATCH = 100;
  let sent = 0;
  for (let i = 0; i < tokens.length; i += BATCH) {
    const batch = tokens.slice(i, i + BATCH).map((to) => ({
      to,
      title,
      body,
      sound: "default",
    }));
    const res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(batch),
    });
    if (!res.ok) {
      throw new Error(`Expo API responded with ${res.status}: ${await res.text()}`);
    }
    sent += batch.length;
  }
  return sent;
}

// ── Page ─────────────────────────────────────────────────────────────────────

const TARGET_OPTIONS: { value: Target; label: string; description: string }[] = [
  {
    value: "all",
    label: "All Users",
    description: "Every user with a push token",
  },
  {
    value: "app_users",
    label: "App Users Only",
    description: "Non-admin accounts",
  },
  {
    value: "admins",
    label: "Admins Only",
    description: "Users with admin role",
  },
];

export default function PushNotificationsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState<Target>("all");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);

  const canSend = title.trim().length > 0 && body.trim().length > 0 && !sending;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend) return;
    setSending(true);
    setResult(null);
    try {
      const users = await getUsers();

      // Filter by target
      const targeted = users.filter((u) => {
        const hasToken =
          typeof u.expoPushToken === "string" && u.expoPushToken.trim().length > 0;
        if (!hasToken) return false;
        if (target === "admins") return u.role === "admin";
        if (target === "app_users") return u.role !== "admin";
        return true; // "all"
      });

      if (targeted.length === 0) {
        setResult({
          ok: false,
          sent: 0,
          message: "No matching users have a push token registered.",
        });
        return;
      }

      const tokens = targeted.map((u) => u.expoPushToken as string);
      const sent = await sendInBatches(tokens, title.trim(), body.trim());
      setResult({
        ok: true,
        sent,
        message: `Sent to ${sent} device${sent !== 1 ? "s" : ""} successfully.`,
      });
    } catch (err) {
      setResult({
        ok: false,
        sent: 0,
        message: err instanceof Error ? err.message : "An unknown error occurred.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#2E2E2E" }}>
          Push Notifications
        </h1>
        <p className="text-sm mt-1" style={{ color: "#B8A9D1" }}>
          Send a push notification directly to app users via Expo
        </p>
      </div>

      {/* Result banner */}
      {result && (
        <div
          className="flex items-start gap-3 rounded-2xl px-5 py-4"
          style={{
            backgroundColor: result.ok ? "#F0FDF4" : "#FFF0F3",
            border: `1.5px solid ${result.ok ? "#BBF7D0" : "#F2C4CE"}`,
          }}
        >
          {result.ok ? (
            <span style={{ color: "#16A34A" }}>
              <CheckCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            </span>
          ) : (
            <span style={{ color: "#E8879C" }}>
              <XCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            </span>
          )}
          <p
            className="text-sm font-medium"
            style={{ color: result.ok ? "#15803D" : "#C0425A" }}
          >
            {result.message}
          </p>
        </div>
      )}

      {/* Form card */}
      <form
        onSubmit={handleSend}
        className="rounded-2xl p-6 space-y-5"
        style={{
          backgroundColor: "#fff",
          border: "1.5px solid #E8D5F0",
          boxShadow: "0 2px 12px rgba(155,109,174,0.08)",
        }}
      >
        {/* Title */}
        <div className="space-y-1.5">
          <label
            htmlFor="notif-title"
            className="block text-sm font-semibold"
            style={{ color: "#4A4A4A" }}
          >
            Notification Title
          </label>
          <input
            id="notif-title"
            type="text"
            placeholder="e.g. New article available"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            className="w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-colors"
            style={{
              backgroundColor: "#F5EEF8",
              border: "1.5px solid #E8D5F0",
              color: "#2E2E2E",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#9B6DAE")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E8D5F0")}
          />
          <p className="text-xs text-right" style={{ color: "#B8A9D1" }}>
            {title.length}/120
          </p>
        </div>

        {/* Body */}
        <div className="space-y-1.5">
          <label
            htmlFor="notif-body"
            className="block text-sm font-semibold"
            style={{ color: "#4A4A4A" }}
          >
            Message Body
          </label>
          <textarea
            id="notif-body"
            placeholder="Write the notification message…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={300}
            rows={4}
            className="w-full px-4 py-2.5 text-sm rounded-xl outline-none resize-none transition-colors"
            style={{
              backgroundColor: "#F5EEF8",
              border: "1.5px solid #E8D5F0",
              color: "#2E2E2E",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#9B6DAE")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E8D5F0")}
          />
          <p className="text-xs text-right" style={{ color: "#B8A9D1" }}>
            {body.length}/300
          </p>
        </div>

        {/* Target selector */}
        <div className="space-y-2">
          <p className="text-sm font-semibold" style={{ color: "#4A4A4A" }}>
            Target Audience
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TARGET_OPTIONS.map((opt) => {
              const selected = target === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTarget(opt.value)}
                  className="flex items-start gap-3 px-4 py-3 rounded-xl text-left transition-all"
                  style={{
                    backgroundColor: selected ? "#F5EEF8" : "#FAFAFA",
                    border: `1.5px solid ${selected ? "#9B6DAE" : "#E8D5F0"}`,
                    boxShadow: selected
                      ? "0 0 0 3px rgba(155,109,174,0.12)"
                      : "none",
                  }}
                >
                  <div
                    className="h-4 w-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center"
                    style={{
                      borderColor: selected ? "#9B6DAE" : "#C69FD5",
                      backgroundColor: selected ? "#9B6DAE" : "transparent",
                    }}
                  >
                    {selected && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white block" />
                    )}
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold leading-tight"
                      style={{ color: selected ? "#9B6DAE" : "#4A4A4A" }}
                    >
                      {opt.label}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: selected ? "#C69FD5" : "#B8A9D1" }}
                    >
                      {opt.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid #E8D5F0" }} />

        {/* Submit */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span style={{ color: "#C69FD5" }}><UsersIcon className="h-4 w-4" /></span>
            <span className="text-xs" style={{ color: "#B8A9D1" }}>
              {target === "all"
                ? "Targeting all users with push tokens"
                : target === "admins"
                ? "Targeting admin accounts only"
                : "Targeting app user accounts only"}
            </span>
          </div>
          <button
            type="submit"
            disabled={!canSend}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{
              background: canSend
                ? "linear-gradient(135deg, #9B6DAE, #C69FD5)"
                : "#E8D5F0",
              color: canSend ? "#fff" : "#B8A9D1",
              cursor: canSend ? "pointer" : "not-allowed",
              boxShadow: canSend
                ? "0 2px 12px rgba(155,109,174,0.30)"
                : "none",
            }}
          >
            {sending ? (
              <>
                <Spinner size="sm" />
                Sending…
              </>
            ) : (
              <>
                <SendIcon className="h-4 w-4" />
                Send Notification
              </>
            )}
          </button>
        </div>
      </form>

      {/* Info card */}
      <div
        className="rounded-2xl px-5 py-4 flex items-start gap-3"
        style={{
          backgroundColor: "#FDFDC9",
          border: "1.5px solid #E8D5F0",
        }}
      >
        <span style={{ color: "#7B6B00" }}><BellIcon className="h-5 w-5 flex-shrink-0 mt-0.5" /></span>
        <div>
          <p className="text-sm font-semibold" style={{ color: "#5C5000" }}>
            How push notifications work
          </p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: "#7B6B00" }}>
            Notifications are sent to users who have the mobile app installed and have granted
            notification permissions. Tokens are stored in Firestore under the{" "}
            <code
              className="px-1 py-0.5 rounded font-mono text-[11px]"
              style={{ backgroundColor: "#F5EEF8", color: "#9B6DAE" }}
            >
              expoPushToken
            </code>{" "}
            field on each user document.
          </p>
        </div>
      </div>
    </div>
  );
}
